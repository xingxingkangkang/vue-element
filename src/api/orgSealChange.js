const USE_MOCK = true

let mockOrgSealChangeRecords = [
  {
    orgCode: '100001',
    accountCnt: 1580,
    procStatus: '2',
    procCnt: 924,
    updateTime: '2026-04-06 09:20:15',
    invalidImageCnt: 12
  },
  {
    orgCode: '100002',
    accountCnt: 920,
    procStatus: '1',
    procCnt: 920,
    updateTime: '2026-04-06 08:15:22',
    invalidImageCnt: 3
  },
  {
    orgCode: '100003',
    accountCnt: 1260,
    procStatus: '0',
    procCnt: 0,
    updateTime: '2026-04-05 17:45:31',
    invalidImageCnt: 0
  },
  {
    orgCode: '100004',
    accountCnt: 640,
    procStatus: '2',
    procCnt: 215,
    updateTime: '2026-04-06 10:08:03',
    invalidImageCnt: 8
  },
  {
    orgCode: '100005',
    accountCnt: 430,
    procStatus: '1',
    procCnt: 430,
    updateTime: '2026-04-04 14:28:09',
    invalidImageCnt: 1
  },
  {
    orgCode: '100006',
    accountCnt: 1780,
    procStatus: '2',
    procCnt: 1088,
    updateTime: '2026-04-06 11:16:44',
    invalidImageCnt: 16
  },
  {
    orgCode: '100007',
    accountCnt: 820,
    procStatus: '0',
    procCnt: 0,
    updateTime: '2026-04-03 16:02:18',
    invalidImageCnt: 0
  },
  {
    orgCode: '100008',
    accountCnt: 1320,
    procStatus: '1',
    procCnt: 1320,
    updateTime: '2026-04-05 09:52:07',
    invalidImageCnt: 5
  },
  {
    orgCode: '100009',
    accountCnt: 560,
    procStatus: '2',
    procCnt: 141,
    updateTime: '2026-04-06 13:36:29',
    invalidImageCnt: 4
  },
  {
    orgCode: '100010',
    accountCnt: 1120,
    procStatus: '0',
    procCnt: 0,
    updateTime: '2026-04-02 18:20:55',
    invalidImageCnt: 0
  },
  {
    orgCode: '100011',
    accountCnt: 760,
    procStatus: '1',
    procCnt: 760,
    updateTime: '2026-04-05 12:43:16',
    invalidImageCnt: 2
  },
  {
    orgCode: '100012',
    accountCnt: 980,
    procStatus: '2',
    procCnt: 486,
    updateTime: '2026-04-06 14:11:38',
    invalidImageCnt: 9
  }
]

function mockRequest(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(data))
    }, 200)
  })
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function toTimestamp(value) {
  if (!value) {
    return 0
  }

  return new Date(value.replace(/-/g, '/')).getTime()
}

function filterRecords(params = {}) {
  const orgCode = (params.orgCode || '').trim()
  const procStatus = params.procStatus || ''
  const executeTimeRange = params.executeTimeRange || []
  const [startTime, endTime] = executeTimeRange
  const startTimestamp = toTimestamp(startTime)
  const endTimestamp = toTimestamp(endTime)

  return mockOrgSealChangeRecords
    .filter((item) => {
      if (orgCode && !item.orgCode.includes(orgCode)) {
        return false
      }

      if (procStatus && item.procStatus !== procStatus) {
        return false
      }

      if (startTimestamp && endTimestamp) {
        const currentTime = toTimestamp(item.updateTime)

        if (currentTime < startTimestamp || currentTime > endTimestamp) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => toTimestamp(b.updateTime) - toTimestamp(a.updateTime))
}

function buildSummary(records) {
  const statusSummary = {
    pending: 0,
    running: 0,
    finished: 0
  }

  const totals = records.reduce(
    (accumulator, item) => {
      accumulator.orgCount += 1
      accumulator.accountCnt += Number(item.accountCnt || 0)
      accumulator.procCnt += Number(item.procCnt || 0)
      accumulator.invalidImageCnt += Number(item.invalidImageCnt || 0)

      if (item.procStatus === '0') {
        statusSummary.pending += 1
      } else if (item.procStatus === '1') {
        statusSummary.finished += 1
      } else if (item.procStatus === '2') {
        statusSummary.running += 1
      }

      return accumulator
    },
    {
      orgCount: 0,
      accountCnt: 0,
      procCnt: 0,
      invalidImageCnt: 0
    }
  )

  return {
    ...totals,
    statusSummary,
    procRate: totals.accountCnt
      ? Number(((totals.procCnt / totals.accountCnt) * 100).toFixed(2))
      : 0
  }
}

export async function fetchOrgSealChangeList(params = {}) {
  if (USE_MOCK) {
    const filteredRecords = filterRecords(params)
    const pageNum = Number(params.pageNum || 1)
    const pageSize = Number(params.pageSize || 10)
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize

    return mockRequest({
      total: filteredRecords.length,
      list: filteredRecords.slice(start, end)
    })
  }

  // TODO: 接入真实后端接口，例如 request.post('/org-seal-change/list', params)
  throw new Error('请先接入机构印模转换查询接口')
}

export async function fetchOrgSealChangeSummary(params = {}) {
  if (USE_MOCK) {
    return mockRequest(buildSummary(filterRecords(params)))
  }

  // TODO: 接入真实后端接口，例如 request.post('/org-seal-change/summary', params)
  throw new Error('请先接入机构印模转换汇总接口')
}

export async function updateOrgSealChangeRecord(payload) {
  if (USE_MOCK) {
    const target = mockOrgSealChangeRecords.find(
      (item) => item.orgCode === payload.orgCode
    )

    if (!target) {
      throw new Error('未找到对应机构记录')
    }

    target.procStatus = payload.procStatus
    target.accountCnt = Number(payload.accountCnt || 0)
    target.updateTime = createCurrentTime()

    if (target.procCnt > target.accountCnt) {
      target.procCnt = target.accountCnt
    }

    return mockRequest({
      success: true
    })
  }

  // TODO: 接入真实后端接口，例如 request.post('/org-seal-change/update', payload)
  throw new Error('请先接入机构印模转换修改接口')
}

export async function deleteOrgSealChangeRecord(orgCode) {
  if (USE_MOCK) {
    const nextRecords = mockOrgSealChangeRecords.filter(
      (item) => item.orgCode !== orgCode
    )

    if (nextRecords.length === mockOrgSealChangeRecords.length) {
      throw new Error('未找到对应机构记录')
    }

    mockOrgSealChangeRecords = nextRecords

    return mockRequest({
      success: true
    })
  }

  // TODO: 接入真实后端接口，例如 request.post('/org-seal-change/delete', { orgCode })
  throw new Error('请先接入机构印模转换删除接口')
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function createCurrentTime() {
  const now = new Date()

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join('-') + ' ' + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join(':')
}
