import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // Configure the perspective table on schema.
    const schema = {
      //To calculate the ratio, we need price_abc and price_def.
      price_abc: 'float',
      price_def: 'float',
      //Get two stocks ratio.
      ratio: 'float',
      //Track with respect to time.
      timestamp: 'date',
      //Track upper_bound, lower_bound.
      upper_bound: 'float',
      lower_bound: 'float',
      //Track the moment when upper_bound and lower_bound are crossed.
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      //'view'- visualize the data.
      elem.setAttribute('view', 'y_line');
      //'row-pivots' takes care of x-axis and allows us to map each datapoint based on its timestamp.
      elem.setAttribute('row-pivots', '["timestamp"]');
      //'columns' allows to focus on a particular part of a datapoint's data along the y-axis.
      elem.setAttribute('columns', '["ratio","lower_bound", "upper_bound", "trigger_alert"]');
      //'aggregates' allows us to handle the duplicate data and consolidate them into one data point.
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      //Get executed whenver the component dupdates, i.e. when the graph gets new data.
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
