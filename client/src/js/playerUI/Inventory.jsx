import React from 'react'
export default class Inventory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inventoryDisplay: []
        }
        this.getItemName = this.getItemName.bind(this)
    }

    componentDidMount() {
        const { inventoryItems } = this.props;
        let inventory = [];
        for (let prop in inventoryItems) {
            let item = inventoryItems[prop];
            if (item.hasOwnProperty('inInventory') && item.inInventory === true) {
                //normalize the item's name
                item.name = this.getItemName(item, prop)
                inventory.push(item)
            }
        }
        this.setState({ inventoryDisplay: inventory })
    }

    getItemName(item, key) {
        if (item.name) {
            return item.name;
        }
        else if (item.subObjectName) {
            return item.subObjectName;
        }
        else return key;
    }

    render() {
        const { inventoryDisplay } = this.state;

        if(inventoryDisplay.length < 1) {
          return <div className="Inventory">Inventory is currently empty! </div>
        }

        return (<div className="Inventory Inventory--options">{inventoryDisplay.map((item, index) => {
                let count = item.count ? item.count + 'x' : '';
                return <div key={index} className="Inventory__item">{`${item.name} ${count}`}</div>
            })}</div>)
    }
}
