import getBookAndPlugin from '../lib/get-book-plugin.js'

async function generateContent (name, item) {
  const { importPkg } = this.bajo.helper
  const { isArray, isFunction, isPlainObject } = await importPkg('lodash-es')
  const results = ['---']
  let type = ''
  if (isArray(item)) type = 'array'
  else if (isFunction(item)) {
    if (item.constructor.name === 'AsyncFunction') type = 'async function'
    else type = 'function'
  } else if (isPlainObject(item)) type = 'object'
  results.push(`title: ${type} ${name}${isFunction(item) ? '()' : ''}`, '---')
  results.push('\n###### Parameters:\n')
  results.push('| Name | Type | Default Value | Description |')
  results.push('| ---- | ---- | ------------- | ----------- |')
  results.push('\n###### Returns:\n')
  results.push('\n#### Example\n')
  return results.join('\n')
}

async function createHelperSkels (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, keys, kebabCase } = await importPkg('lodash-es')
  const [fs, input] = await importPkg('fs-extra', 'bajo-cli:@inquirer/input')
  const { plugin, bookId, bookPath } = await getBookAndPlugin.call(this, args)
  let [helperPath] = args
  helperPath = await input({
    message: print.__('Please enter a root directory for helper pages:'),
    default: helperPath ?? 'api/helper'
  })
  if (isEmpty(helperPath)) print.fatal('You must enter a root directory for helper pages first')
  const config = getConfig()
  if (keys(this[plugin].helper).length === 0) print.fatal('Plugin doesn\'t have any helper')
  const dir = `${bookPath}/${bookId}/pages/${helperPath}`
  if (fs.existsSync(dir)) print.warn('Directory \'%s\' already exist', dir)
  for (const name in this[plugin].helper) {
    const basename = `${kebabCase(name)}.md`
    const file = `${dir}/${basename}`
    if (fs.existsSync(file) && !config.force) {
      print.fail('File for helper \'%s\' exist already, won\'t overwrite without --force', name)
      continue
    }
    const content = await generateContent.call(this, name, this[plugin].helper[name])
    await fs.outputFile(file, content, 'utf8')
    print.succeed('Writing to \'%s\'', dir.replace(bookPath, '') + '/' + basename)
  }
  print.succeed('Done!')
}

export default createHelperSkels