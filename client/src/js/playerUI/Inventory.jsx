import React from 'react'
import Sprite from './Sprite.jsx'

export default class Inventory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inventoryDisplay: []
        }
        this.getItemName = this.getItemName.bind(this)
        this.inventoryStyles = this.inventoryStyles.bind(this)
    }

    componentDidMount() {
        const { inventoryItems, maxInvSize, preventAddOnFull, dropLastOnFull } = this.props;
        let inventory = [];
        for (let prop in inventoryItems) {
            let item = inventoryItems[prop];
            if (item.hasOwnProperty('inInventory') && item.inInventory === true) {
                if (preventAddOnFull && inventory.length === maxInvSize) {
                    return;
                }
                //normalize the item's name
                item.name = this.getItemName(item, prop)
                if (inventory.length < maxInvSize) {
                    inventory.push(item);
                }
                if (inventory.length === maxInvSize && dropLastOnFull) {
                    inventory.pop();
                    inventory.push(item);
                }
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

    inventoryStyles() {
        // this function might be used in future
        if (this.props.fullscreen) {
            return {
                width: '100%',
                height: '100%'
            }
        } else {
            return {
                top: '25%',
                left: '25%',
                width: '50%',
                height: '40%'
            }
        }
    }

    render() {
        const { inventoryDisplay } = this.state;
        const { fullscreen } = this.props;
        return inventoryDisplay.length < 1 ? <p>Inventory is currently empty! </p> :
            (<div className={`Inventory ${false ? 'Inventory--fullscreen' : 'Inventory--halfscreen'} Inventory--options`}>{inventoryDisplay.map((item, index) => {
                let count = item.count ? item.count + 'x' : '';
                return <div key={index} className="Inventory__item">{`${item.name} ${count}`}</div>
            })}</div>)
    }
}

