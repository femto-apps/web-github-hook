const config = require('@femto-apps/config')
const express = require('express')
const crypto = require('crypto')

const FemtoDev = require('./modules/femtodev')
const Fallback = require('./modules/fallback')

const modules = [FemtoDev]
modules.push(Fallback) // in case nothing else matches

const sigHeaderName = 'X-Hub-Signature'

const app = express()

app.use(express.json())

function verifyPostData(req, res, next) {
    const payload = JSON.stringify(req.body)
    if (!payload) {
        return next('Request body empty')
    }
  
    const sig = req.get(sigHeaderName) || ''
    const hmac = crypto.createHmac('sha1', config.get('github.secret'))
    const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
    const checksum = Buffer.from(sig, 'utf8')
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
    }
    return next()
}

app.post('/webhook/github', verifyPostData, (req, res) => {
    const repositoryName = req.body.repository.full_name
    const branchName = req.body.ref.split('/').slice(2).join('/')

    let module

    for (let Type of modules) {
        module = new Type(repositoryName, branchName)

        if (module.check()) {
            // this is the one!
            break
        }
    }

    module.update()

    res.send('success')
})

app.use((err, req, res, next) => {
    if (err) console.error(err)
    res.status(403).send('Request body was not signed or verification failed')
  })


app.listen(9182, () => console.log('server listening on port 9182'))