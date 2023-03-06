//Process the raw stock data we receive from the server before the Graph component renders it.
import { ServerRespond } from './DataStreamer';

export interface Row {
  //Matched with Graph.tsx's perspectives.
  //Determines the structure of the object returned by the generateRow function
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  //Process raw server data
  static generateRow(serverRespond: ServerRespond[]): Row {
    //Access serverRespond as an an array wherein [0] is stock ABC and [1] is stock DEF.
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) /2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) /2;
    const ratio = priceABC / priceDEF;
    //Be able to maintain datas as steady upper and lower lines on the graph.
    const upperBound = 1 + 0.02;
    const lowerBound = 1 - 0.02;
    return {
      //Changed to a single Row Object.
      //It explains why we also adjusted the argument we passed to table.update in Graph.tsx so that consistency is preserved.
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      //Has a value if the threshold is passed by the ratio
      //Otherwise if the ratio remains within the threshold, no value/undefined will suffice.
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
 
  }
}
