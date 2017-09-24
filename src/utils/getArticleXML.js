import R from 'ramda'
import xml from 'xml'

const commonStructure = ({
  UUID,
  time,
  articles,
}) => ({
  articles: [
    { UUID },
    { time },
    ...articles,
  ],
})

const getArticle = ({
  id,
  startYmdtUnix,
  endYmdtUnix,
  post_title: title,
  category,
  subCategory,
  post_date: publishTimeUnix,
  post_content: content, // CDTA data: <![CDATA html tag or pure text ]]>
  guid: sourceUrl,
}) => ({
  article: [
    { id },
    { startYmdtUnix },
    { endYmdtUnix },
    { nativeCountry: 'TW' },
    { language: 'zh' },
    { title },
    { category },
    { subCategory },
    { publishTimeUnix },
    { contentType: 0 },
    {
      contents: [{
        text: [{
          content,
        }],
      }],
    },
    { sourceUrl },
  ],
})

const getArticleXML = ({
  uuid,
  time,
  rawArticles,
}) => {
  const articles = R.pipe(
    R.map(R.evolve({
      post_date: d => Date.parse(new Date(d)),
      post_content: content => `<![CDATA ${content} ]]>`,
    })),
    R.map(getArticle),
  )(rawArticles)
  const result = xml(
    commonStructure({ UUID: uuid, time, articles }),
    { declaration: { encoding: 'UTF-8' } },
  )
  return result
}

export default getArticleXML
