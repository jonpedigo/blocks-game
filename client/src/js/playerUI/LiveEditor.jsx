import React from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class LiveEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: this.props.data
        }
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    // Update current state with changes from controls
    handleUpdate(newData) {
        this.setState(prevState => ({
            data: { ...prevState.data, ...newData }
        }), () => {
            GAME.heros[HERO.id] = Object.assign({}, this.state.data)
        });
    }

    render() {
        const hero = GAME.heros[HERO.id]
        console.log(hero, 'hero')
        const { data } = this.state;
        console.log(data, 'data')
        return (
            <div style={{ position: 'absolute', width: '1000px' }} className='LiveEditor'>
                <DatGui data={data} onUpdate={this.handleUpdate}>
                    {/* <DatString path='package' onChange={this.handleChange} label='Package' /> */}
                    <DatNumber path='speed' label='Speed' min={0} max={1000} step={1} />
                    {/* <DatBoolean path='isAwesome' label='Awesome?' /> */}
                    {/* <DatColor path='feelsLike' label='Feels Like' /> */}
                </DatGui>
            </div>
        )
    }
}