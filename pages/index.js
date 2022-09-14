import Head from 'next/head'
import Image from 'next/image'
import { Layout, Row, Col, Button, PageHeader, Input, Table } from 'antd';
import { GithubOutlined } from "@ant-design/icons";
import useSWR from 'swr';

const { Header, Footer, Content } = Layout;


const columns = [
  {
    title: 'Item Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
  },
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
    items.push({ name: price3[key].name, niceProfit: profit.toLocaleString(), profit, high, highPriceVolume, low, lowPriceVolume, limit })

  })
  items.sort((a, b) => b.profit - a.profit)
  return { data: items, isLoading: false, isError: error1 || error2 || error3 }
}

export default function Home() {
  const { data: dataSource, isLoading, isError } = usePrices()
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#f0f0f0" }}>
        <Row justify="space-between">
          <Col>
            <img
              style={{
                float: "left",
                height: 31,
                // width: 200,
                margin: "16px 0px 16px 0",
              }}
              src="https://tse3.mm.bing.net/th?id=OIP.XYaeDXspGLV6vl4xFh7CDgHaHa"
              alt="abg logo"
            />
            <b> Runescape Merch</b>
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
          Enter a smart contract address below to see all historic events
          emitted from that contract.{" "}
        </PageHeader>

        <div style={{ background: "#fff", padding: 24 }}>
          <div>
            <Table loading={isLoading} dataSource={dataSource} columns={columns} />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Created by <a href="https://abg.garden">Always Be Growing</a>
      </Footer>
    </Layout>)
}
