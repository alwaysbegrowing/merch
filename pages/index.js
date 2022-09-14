import Head from 'next/head'
import Image from 'next/image'
import { Layout, Row, Col, Button, PageHeader, Input, Table } from 'antd';
import { GithubOutlined } from "@ant-design/icons";
import useSWR from 'swr';

const { Header, Footer, Content } = Layout;


const columns = [

  {
    title: 'Item Name',
    key: 'name',
    render: (data) => {
      const site = "https://oldschool.runescape.wiki/images/a/a3/"
      const modifiedIcon = data.icon.replace(/ /g, "_");
      const url = site + modifiedIcon
      return <><img style={{ margin: 8 }} src={url}></img>{data.name}</>
    }

  },
  {
    title: 'Profit',
    dataIndex: 'niceProfit',
    key: 'profit'
  },
  {
    title: 'Sell Price',
    dataIndex: 'high',
    key: 'high'
  },
  {
    title: 'Buy Price',
    dataIndex: 'low',
    key: 'low'
  },
  {
    title: 'Buy Volume',
    dataIndex: 'lowPriceVolume',
    key: 'lowPriceVolume'
  },
  {
    title: 'Sell Volume',
    dataIndex: 'highPriceVolume',
    key: 'highPriceVolume'
  },

  {
    title: 'Item Limit',
    dataIndex: 'limit',
    key: 'limit'
  }

];



const fetcher = (...args) => fetch(...args).then(res => res.json())

function usePrices() {
  const { data: tempPrice1, error1 } = useSWR('https://prices.runescape.wiki/api/v1/osrs/5m', fetcher);
  const { data: tempPrice2, error2 } = useSWR('https://prices.runescape.wiki/api/v1/osrs/latest', fetcher);
  const { data: allItems, error3 } = useSWR('https://prices.runescape.wiki/api/v1/osrs/mapping', fetcher);
  if (!tempPrice1 || !tempPrice2 || !allItems) return { isLoading: true }
  const price1 = tempPrice1.data
  const price2 = tempPrice2.data
  const price3 = {}
  allItems.forEach(item => {
    price3[(item.id).toString()] = item
  })
  const keys = Object.keys(price1)
  const items = []
  keys.forEach(key => {
    const limit = price3[key].limit
    const { avgHighPrice, highPriceVolume, avgLowPrice, lowPriceVolume } = price1[key]
    const { high, low } = price2[key]
    const volume = (highPriceVolume + lowPriceVolume) / 2
    const tax = (high * .01)
    const sellValue = high - tax
    const maxBuy = Math.min(limit, volume)
    const profit = (sellValue - low) * (maxBuy)
    if (!high || !low || (high <= low) || (Math.abs(highPriceVolume - lowPriceVolume) > (1.5 * volume))) return
    items.push({
      name: price3[key].name, icon: price3[key].icon, niceProfit: profit.toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }), profit, high: high.toLocaleString(), highPriceVolume: highPriceVolume.toLocaleString(), low: low.toLocaleString(), lowPriceVolume: lowPriceVolume.toLocaleString(), limit: limit?.toLocaleString()
    })

  })
  items.sort((a, b) => b.profit - a.profit)
  return { data: items, isLoading: false, isError: error1 || error2 || error3 }
}

export default function Home() {
  const { data: dataSource, isLoading, isError } = usePrices()
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#d9d9d9" }}>
        <Row justify="space-between">
          <Col>
            <img
              style={{
                float: "left",
                height: 31,
                // width: 200,
                margin: "16px 8px 16px ",
              }}
              src="https://theme.zdassets.com/theme_assets/851856/a4c948526ee4b6f23c99ac58ff4a636c25e0bf9d.png"
              alt="abg logo"
            />
            <b>  Runescape Merch</b>
          </Col>
          <Col>
            <Button
              onClick={() => {
                window.open("https://github.com/alwaysbegrowing/merch");
              }}
              type="text"
            >
              <GithubOutlined />
            </Button>
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: "0 24px", marginTop: 16 }}>

        <PageHeader
          style={{ backgroundColor: "#fff" }}
          title="Item Flipper"
        >
          See the highest profit items to flip within the last 5 minutes.{" "}
        </PageHeader>

        <div style={{ background: "#fff", padding: 24 }}>
          <div>
            <Table
              loading={isLoading}
              dataSource={dataSource}
              columns={columns}
              rowKey={(index) => {
                dataSource.logIndex + Math.random() * index
              }} />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Created by <a href="https://abg.garden">Always Be Growing</a>
      </Footer>
    </Layout>)
}
