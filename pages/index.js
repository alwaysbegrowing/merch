import Head from 'next/head'
import Image from 'next/image'
import { Layout, Row, Col, Button, PageHeader, Input, Table } from 'antd';
import { GithubOutlined } from "@ant-design/icons";

const { Header, Footer, Content } = Layout;

const dataSource = [
  {
    key: '1',
    name: 'Mike',
    price: 32,
    volume: '10 Downing Street',
  },
  {
    key: '2',
    name: 'John',
    price: 42,
    volume: '10 Downing Street',
  },
];

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



export default function Home() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#f6ffed" }}>
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
            <Table dataSource={dataSource} columns={columns} />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Created by <a href="https://abg.garden">Always Be Growing</a>
      </Footer>
    </Layout>)
}
