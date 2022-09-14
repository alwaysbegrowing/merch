export default function Script() {

    const data1 = await fetch("https://prices.runescape.wiki/api/v1/osrs/5m");
    const price1 = (await data1.json()).data

    const data2 = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest')
    const price2 = (await data2.json()).data

    const data3 = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping')
    const allItems = (await data3.json())
    const price3 = {}
    allItems.forEach(item => {
        price3[(item.id).toString()] = item
    })


    // const allData = {price1, ...data1.price2}
    // loop through each of the items and do (avgHighPrice - avgLowPrice) * (averageLowVolume + averageHighVolume) 


    const keys = Object.keys(price1)
    const items = []
    keys.forEach(key => {
        const limit = price3[key].limit
        const { avgHighPrice, highPriceVolume, avgLowPrice, lowPriceVolume } = price1[key]
        const { high, low } = price2[key]
        const volume = (highPriceVolume + lowPriceVolume) / 2
        const tax = (high * .01)
        sellValue = high - tax
        const maxBuy = Math.min(limit, volume)
        const profit = (sellValue - low) * (maxBuy)
        if (!high || !low || (high <= low) || (Math.abs(highPriceVolume - lowPriceVolume) > (1.5 * volume))) return
        items.push({ name: price3[key].name, niceProfit: profit.toLocaleString(), profit, high, highPriceVolume, low, lowPriceVolume, limit })

    })
    items.sort((a, b) => b.profit - a.profit)
};
