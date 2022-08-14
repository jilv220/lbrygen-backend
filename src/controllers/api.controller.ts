import { Controller, Get, Query, Res, CacheInterceptor, UseInterceptors } from '@nestjs/common'
import { AppService } from '../app.service'
import * as fs from 'fs'
import { join } from 'path'

import { apiCall } from '../lbry'
import { filterDup } from '../arrayUtils'
import { API_BASE, STREAM_IP } from '../env'

const PAGE_SIZE = 20

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class ApiController {
  constructor(private readonly appService: AppService) { }

  @Get('resolveSingle')
  async resolveSingle(@Query() query, @Res() res): Promise<any> {
    let canonUrl = query.curl

    let params = {
      method: 'resolve',
      params: { urls: canonUrl === undefined ? undefined : canonUrl }
    }

    apiCall(params)
      .then((daemonRes) => {
        //console.log(daemonRes)
        res.send(daemonRes)
      })
  }

  @Get('search')
  async claimSearch(@Query() query, @Res() res): Promise<any> {

    let tag = query.t
    let text = query.q
    let channel = query.c
    let channelIDs = query.chs

    let pageNum = query.p
    let pageSize = query.ps
    let streamType = query.st

    let order = query.o

    let searchParams = {
      text: text === undefined ? undefined : text,
      fee_amount: '<=0',   // only serve free content
      page: pageNum === undefined ? 1 : Number(pageNum),
      page_size: pageSize == undefined ? PAGE_SIZE : Number(pageSize),
      stream_type: streamType === undefined ? ['video'] : [streamType],
      order_by: order === undefined ? 'release_time' : order,
      any_tags: tag == undefined ? undefined : typeof tag === 'string' ? [tag] : tag,
      channel: channel === undefined ? undefined : channel,
      channel_ids: channelIDs === undefined ? undefined : channelIDs,
      no_totals: true
    }

    // console.log(tag)
    let params = {
      method: 'claim_search',
      params: searchParams
    }

    try {
      let data = await apiCall(params)
      res.send(data)
    }
    catch (err) {
      res.send(err)
    }
  }

  @Get('fetch')
  async fetchContents(@Query() query, @Res() res): Promise<any> {

    let category = query.ctgy
    let pageNum = query.p
    let isFetchNext = (query.n === 'y')

    const fileContents = fs.readFileSync(join('./res', 'data.json'), 'utf8')
    try {

      const data = JSON.parse(fileContents)
      let chIds

      switch (category) {
        case 'featured':
          chIds = data.en.categories.PRIMARY_CONTENT.channelIds
          break
        case 'education':
          chIds = data.en.categories.EDUCATION.channelIds
          break
        case 'gaming':
          chIds = data.en.categories.GAMING.channelIds
          break
        case 'tech':
          chIds = data.en.categories.TECHNOLOGY.channelIds
          break
        case 'news':
          chIds = data.en.categories.NEWS_AND_POLITICS.channelIds
          break
      }

      let searchParams = {
        text: undefined,
        fee_amount: '<=0',   // only serve free content
        page: 1,
        page_size: 40,
        stream_type: ['video'],
        order_by: 'release_time',
        any_tags: undefined,
        channel: undefined,
        channel_ids: chIds,
        no_totals: true
      }

      let params = {
        method: 'claim_search',
        params: searchParams
      }

      let daemonRes: any
      if (isFetchNext) {
        searchParams.page = Number(pageNum)
        searchParams.page_size = 20
      }

      daemonRes = await apiCall(params)
      daemonRes.result.items = filterDup(daemonRes.result?.items)

      if (isFetchNext) {
        daemonRes.result.items = daemonRes.result?.items.slice(0, 8)
      } else {
        daemonRes.result.items = daemonRes.result?.items.slice(0, 20)
      }

      res.send(daemonRes)

    } catch (err) {
      console.error(err)
    }
  }

  @Get('getStream')
  async getStream(@Query() query, @Res() res): Promise<any> {

    let uri = query.url as string | undefined
    let download = query.d

    let isDownload = false
    if (download === 'y') {
      isDownload = true
    }

    let params = {
      method: 'get',
      params: {
        uri: uri === undefined ? undefined : uri,
        save_file: isDownload,
        file_name: (uri && isDownload) ? uri.replace('lbry://', '') : undefined,
        timeout: 10
      }
    }

    apiCall(params)
      .then((daemonRes: any) => {

        if (daemonRes.result.streaming_url) {
          daemonRes.result.streaming_url =
            daemonRes.result.streaming_url.replace(STREAM_IP, API_BASE)
        }
        res.send(daemonRes.result)
      })
  }
}