import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'

import {STREAM_IP, API_BASE} from './env'
import {filterDup} from './arrayUtils'
import Lbry from './lbry'

const app = express()

// Api config
const PAGE_SIZE = 20

// app.use(cors())
// app.use(compression())
// app.use('/', routes)

// Middleware config
// let cache = apicache.middleware