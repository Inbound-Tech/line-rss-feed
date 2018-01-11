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
  startYmdtUnix = 1457280000000, // 2016-03-06
  endYmdtUnix = 4095273600000, // 2099-10-10
  post_title: title,
  category,
  subCategory,
  post_date: publishTimeUnix,
  update_date: updateTimeUnix,
  post_content: content, // CDTA data: <![CDATA[ html tag or pure text ]]>
  author,
  url: sourceUrl,
}) => ({
  article: [
    { ID: id },
    { startYmdtUnix },
    { endYmdtUnix },
    { nativeCountry: 'TW' },
    { language: 'zh' },
    { title },
    { category },
    { subCategory },
    { publishTimeUnix },
    { updateTimeUnix },
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
      update_date: d => Date.parse(new Date(d)),
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
