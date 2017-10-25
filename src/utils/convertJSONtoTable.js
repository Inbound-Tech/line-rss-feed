import R from 'ramda'

const escapeHTML = R.when(
  R.is(String),
  R.pipe(
    R.replace(/&/g, '&amp;'),
    R.replace(/</g, '&lt;'),
    R.replace(/>/g, '&gt;'),
  ),
)
const convertJSONtoTable = (JSONData) => {
  const keys = R.pipe(
    R.map(R.keys),
    R.flatten,
    duplicateKeys => new Set(duplicateKeys),
    keySet => Array.from(keySet),
  )(JSONData)

  return `
<table class="table table-striped">
  <thead>
    <tr>
      ${keys.map((key => `<th>${key}</th>`)).join('\n')}
    </tr>
  </thead>
  <tbody>
    ${JSONData.map(entry => `
    <tr>
      ${R.values(entry).map((data => `<th>${escapeHTML(data)}</th>`)).join('\n')}
    </tr>
    `).join('\n')}
  </tbody>
</table>
`
}

export default convertJSONtoTable
