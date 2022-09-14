let data1 = await fetch("https://prices.runescape.wiki/api/v1/osrs/5m");
let price1 = (await data1.json()).data

let data2 = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest')
let price2 = (await data2.json()).data

let data3 = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping')
let allItems = (await data3.json())
let price3 = {}
allItems.forEach(item => {
    price3[(item.id).toString()] = item
})


// let allData = {price1, ...data1.price2}
// loop through each of the items and do (avgHighPrice - avgLowPrice) * (averageLowVolume + averageHighVolume) 


let keys = Object.keys(price1)
let items = []
keys.forEach(key => {
    let limit = price3[key].limit
    let { avgHighPrice, highPriceVolume, avgLowPrice, lowPriceVolume } = price1[key]
    let { high, low } = price2[key]
    let volume = (highPriceVolume + lowPriceVolume) / 2
    const tax = (high * .01)
    sellValue = high - tax
    let maxBuy = Math.min(limit, volume)
    let profit = (sellValue - low) * (maxBuy)
    if (!high || !low || (high <= low) || (Math.abs(highPriceVolume - lowPriceVolume) > (1.5 * volume))) return
    items.push({ name: price3[key].name, niceProfit: profit.toLocaleString(), profit, high, highPriceVolume, low, lowPriceVolume, limit })

})
items.sort((a, b) => b.profit - a.profit)
