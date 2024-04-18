async function buildBooks ({ path, args }) {
  const { importPkg, print, importModule, getConfig } = this.bajo.helper
  const { buildBooks } = this.bajoBook.helper
  const prompts = await importPkg('bajoCli:@inquirer/prompts')
  const { confirm } = prompts
  const answer = await confirm({
    message: print.__('You\'re about to rebuild all books. Continue?'),
    default: false
  })
  if (!answer) {
    print.fail('Aborted!')
    process.kill(process.pid, 'SIGINT')
    return
  }
  const cfg = getConfig('bajoDb', { full: true })
  const start = await importModule(`${cfg.dir.pkg}/bajo/start.js`)
  await start.call(this, 'all')
  await buildBooks()
}

export default buildBooks
