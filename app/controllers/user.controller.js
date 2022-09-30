const { resolve } = require('path');

const testFolder = '/volume4/Safe/Anime/'

exports.video = async (req, res) => {
	const fs = require('fs');
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	// var result = [];
	var count = 0;
	const files = await getFiles(testFolder)
	files.sort(
		(a, b) =>
			fs.statSync(testFolder + '/' + b).mtime -
			fs.statSync(testFolder + '/' + a).mtime
	)

	const result = await getVideo(files)
	res.write(JSON.stringify(result));
	res.end();
}

exports.videoID = (req, res) => {
	const fs = require('fs');
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Credentials', 'true')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	)
	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	var result = []
	var count = 0
	console.log(testFolder + req.params.id)
	fs.readdir(testFolder + req.params.id, (err, files) => {
		console.log(files)
		if (files) {
			files.sort(
				(a, b) =>
					a.split('.')[0].replace(/\D+/g, '') -
					b.split('.')[0].replace(/\D+/g, '')
			)


			files.forEach((file) => {
				if (file.includes('mp4') || file.includes('wmv') || file.includes('mkv')) {
					if (file != '@eaDir') {
						// file = file.split('.')[0]
						result[count] = { src: file }
						count++
					}
				}
			})
		}
		res.write(JSON.stringify(result))
		res.end()
	})
}

exports.videoBody = (req, res) => {
	const fs = require('fs');
	const path = testFolder + req.params.id + '/' + req.params.target

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
		file.pipe(res)
		res.writeHead(206, head)
		// console.log(res)
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
}


const getFiles = async (path) => {
	const fs = require('fs').promises;
	return await fs.readdir(path)
}

const getVideo = async (files) => {
	const res = []
	const fs = require('fs').promises;
	return new Promise(async (resolve, reject) => {
		for (let i = 0; i < files.length; i++) {
			let file = files[i]
			var o = {}
			const hasDir = await checkdir(file)

			o.title = file
			o.dir = false
			
			if (hasDir) {
				o.dir = true
			}
			res.push(o)
		}
		return resolve(res)
	})
}

const checkdir = async (file) => {
	const fs = require('fs')
	const f = await getFiles(testFolder + file)
	return new Promise((resolve, reject) => {
		for (let j= 0; j < f.length; j++) {
			if (f[j] == '@eaDir') continue
			if (fs.statSync(testFolder + file + "/" + f[j]).isDirectory()) {
				resolve(true)
				break
			}
		}
		resolve(false)
	})
}


// exports.allAccess = (req, res) => {
// 	res.status(200).send('Public Content.')
// }

// exports.userBoard = (req, res) => {
// 	console.log(req)
// 	res.status(200).send('User Content.')
// }

// exports.adminBoard = (req, res) => {
// 	res.status(200).send('Admin Content.')
// }

// exports.moderatorBoard = (req, res) => {
// 	res.status(200).send('Moderator Content.')
// }
