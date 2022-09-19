import Head from "next/head";
import Image from "next/image";
import { Layout, Row, Col, Button, PageHeader, Input, Table } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import useSWR from "swr";
import { useState } from "react";
import {
  timeDifferenceForDate,
} from "readable-timestamp-js";

const { Header, Footer, Content } = Layout;

const columns = [
  {
    title: "Item Name",
    key: "name",
    render: (data) => {
      const site = "https://oldschool.runescape.wiki/images/a/a3/";
      const modifiedIcon = data.icon.replace(/ /g, "_");
      const url = site + modifiedIcon;
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://prices.runescape.wiki/osrs/item/${data.id}`}
        >
          <img style={{ margin: 8 }} src={url}></img>
          {data.name}
        </a>
      );
    },
  },

  {
    title: "Profit",
    render: (data) => {
      return <><div>Spread: {data.profit.toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
        <div>Average:{data.avgProfit.toLocaleString("en", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
        </div>
      </div>
      </>
    },
    key: "profit",
  },
  {
    title: "Post Tax Margin",
    render: (data) => {
      return data.margin.toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    }, key: "margin",
  },
  {
    title: "Spread",
    key: "name",
    render: (data) => {
      return (
        <>
          <li>
            Buy Price: <span style={{ color: "#52c41a" }}>{data.low.toLocaleString()}</span>
          </li>
          <li style={{ color: "#bfbfbf" }}>{data.lowTime}</li>
          <li>
            Sell Price: <span style={{ color: "#52c41a" }}>{data.high}</span>
          </li>
          <li>
            <li style={{ color: "#bfbfbf" }}>{data.highTime}</li>

          </li>
        </>
      );
    },
  },
  {
    title: "Average Prices",
    key: "name",
    render: (data) => {
      return (
        <>
          <li>
            Buy Price:{" "}
            <span style={{ color: "#52c41a" }}>
              {data.avgLowPrice?.toLocaleString()}
            </span>
          </li>
          <li>
            Sell Price:{" "}
            <span style={{ color: "#52c41a" }}>
              {data.avgHighPrice?.toLocaleString()}
            </span>{" "}
          </li>
        </>
      );
    },
  },
  {
    title: "Average Hourly Volume",
    render: (data) => {
      return (data.dailyVolume / 24).toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    },
    key: "dailyVolume",
  },
  {
    title: "Item Limit",
    dataIndex: "limit",
    key: "limit",
  },
  {
    title: "Full Flip Cost",
    render: (data) => {
      return (data.limit * data.low).toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    },
    key: "flipCost",
  },
  {
    title: "ROI",
    render: (data) => {
      const cost = data.limit * data.low
      const roi = ((data.profit / cost) * 100).toLocaleString() + "%"
      return roi
    },
    key: "flipCost",
  },
];

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function usePrices() {
  const [lastUpdated, setLastUpdated] = useState(null);


  const { data: tempPrice1, error1 } = useSWR(
    "https://prices.runescape.wiki/api/v1/osrs/5m",
    fetcher,
    {
      refreshInterval: 1000, onSuccess: (data) => {
        const didDataChange = JSON.stringify(data) !== JSON.stringify(tempPrice1)
        if (didDataChange) {
          setLastUpdated(new Date());
        }

      }
    },
  );
  const { data: tempPrice2, error2 } = useSWR(
    "https://prices.runescape.wiki/api/v1/osrs/latest",
    fetcher,
    { refreshInterval: 1000 }
  );
  const { data: allItems, error3 } = useSWR(
    "https://prices.runescape.wiki/api/v1/osrs/mapping",
    fetcher,
  );
  const { data: volumes, error4 } = useSWR(
    "https://prices.runescape.wiki/api/v1/osrs/volumes",
    fetcher,
    { refreshInterval: 1000 }
  );

  if (!tempPrice1 || !tempPrice2 || !allItems) return { isLoading: true };
  const price1 = tempPrice1.data;
  const price2 = tempPrice2.data;
  const price3 = {};
  allItems.forEach((item) => {
    price3[item.id.toString()] = item;
  });
  const keys = Object.keys(price3);
  const items = keys.map((key) => {
    const limit = price3[key].limit;
    const { avgHighPrice, highPriceVolume, avgLowPrice, lowPriceVolume } =
      price1[key] || {};
    const { high, low, highTime, lowTime } = price2[key] || {};
    const tax = high * 0.01;
    const sellValue = high - tax;
    // const profit = (sellValue - low) * Math.min(volumes.data[key] / 24, limit);
    const averageHighTax = avgHighPrice * 0.01;
    const hourlyVolume = volumes.data[key] / 24
    const profit = (sellValue - low) * Math.min(limit, hourlyVolume)
    const averageProfit = ((avgHighPrice - averageHighTax) - avgLowPrice) * Math.min(volumes.data[key] / 24, limit);
    const avgProfit = avgHighPrice && avgLowPrice ? averageProfit : 0
    return {
      avgProfit,
      name: price3[key].name,
      icon: price3[key].icon,
      margin: sellValue - low,
      id: key,
      profit,
      avgHighPrice,
      avgLowPrice,
      high: high?.toLocaleString(),
      highPriceVolume: highPriceVolume?.toLocaleString(),
      low,
      dailyVolume: volumes.data[key],
      lowPriceVolume: lowPriceVolume?.toLocaleString(),
      limit,
      highTime: timeDifferenceForDate(highTime * 1000),
      lowTime: timeDifferenceForDate(lowTime * 1000),
    };
  })
  const data = items.filter(num => !isNaN(num.profit))
  data.sort((a, b) => {
    return b.profit - a.profit
  }
  );

  return {
    data,
    isLoading: false,
    isError: error1 || error2 || error3 || error4,
    lastUpdated
  };
}

export default function Home() {
  const { data: dataSource, isLoading, isError, lastUpdated } = usePrices();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#d9d9d9" }}>
        <Row justify="space-between">
          <Col>
            <img
              style={{
                float: "left",
                height: 31,
                margin: "16px 8px 16px ",
              }}
              src="https://theme.zdassets.com/theme_assets/851856/a4c948526ee4b6f23c99ac58ff4a636c25e0bf9d.png"
              alt="rs logo"
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
        {lastUpdated && <PageHeader style={{ backgroundColor: "#fff" }} title="Item Flipper">
          See the highest profit items to flip based on spread volume and limit.
          Data last updated {new Date() - lastUpdated} seconds ago.
        </PageHeader>}

        <div style={{ background: "#fff", padding: 24 }}>
          <div>
            <Table
              pagination={{ defaultPageSize: 400 }}
              loading={isLoading}
              dataSource={dataSource}
              columns={columns}
              scroll={{ x: 400 }}
              rowKey={(index) => {
                dataSource.logIndex + Math.random() * index;
              }}
            />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Created by <a href="https://abg.garden">Always Be Growing</a>
      </Footer>
    </Layout>
  );
}
