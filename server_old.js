const express = require('express')
const fs = require('fs')
const app = express()
const cors = require('cors')
const testFolder = '../'

app.use(cors())
app.get('/', function (request, response) {
	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Access-Control-Allow-Credentials', 'true')
	response.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT'
	)
	response.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	)
	response.setHeader('Content-Type', 'application/json; charset=utf-8')
	var res = []
	var count = 0
	fs.readdir(testFolder, (err, files) => {
		files.forEach((file) => {
			if (file != 'server' && file != 'animegogo' && file != 'main') {
				res[count] = { title: file }
				count++
			}
		})
		response.write(JSON.stringify(res))
		response.end()
	})
})

app.get('/:id', function (request, response) {
	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Access-Control-Allow-Credentials', 'true')
	response.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT'
	)
	response.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	)
	response.setHeader('Content-Type', 'application/json; charset=utf-8')
	var res = []
	var count = 0
	fs.readdir(testFolder + request.params.id, (err, files) => {
		if (files) {
			files.sort(
				(a, b) =>
					a.split('.')[0].replace(/\D+/g, '') -
					b.split('.')[0].replace(/\D+/g, '')
			)
			files.forEach((file) => {
				res[count] = { src: file }
				count++
			})
			response.write(JSON.stringify(res))
			response.end()
		}
	})
})

app.get('/:id/:target', function (req, res) {
	const path = testFolder + req.params.id + '/' + req.params.target + '.wmv' 
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
	if (range) {
		const parts = range.replace(/bytes=/, '').split('-')
		const start = parseInt(parts[0], 10)
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
		const chunksize = end - start + 1
		const file = fs.createReadStream(path, { start, end })
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4'
		}
		res.writeHead(206, head)
		file.pipe(res)
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4'
		}
		res.writeHead(200, head)
		fs.createReadStream(path).pipe(res)
	}

	console.log(
		req.socket.remoteAddress + ' ' + req.params.id + req.params.target
	)
	console.log(new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }))
})

app.listen(8888)

console.log('Start at 5567')
