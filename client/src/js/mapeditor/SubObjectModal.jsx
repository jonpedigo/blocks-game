import React, { useState } from 'react'

export default function SubObjectModal() {
    const [name, setName] = useState('');
    const [checked, setCheck] = useState('')

    function handleNameChange(e) {
        setName(e.target.value)
    }

    function handleCheck(e) {
        setCheck(e.target.value)
    }
    return (
        <div id='subObjectModal--container'>
            <input id='subobject-input-name' placeholder="Name" value={name}
                onChange={handleNameChange} />
            <div id='subobject-template-options'>
                <div>
                    <label htmlFor='subobject'>SubObject</label>
                    <input name='checkbox' onChange={handleCheck} type='radio' className='subobject-radio' id='subobject' value={'subobject'} />
                </div>
                <div>
                    <label htmlFor='potential'>Potential</label>
                    <input name='checkbox' onChange={handleCheck} type='radio' className='subobject-radio' id='potential' value={'potential'} />
                </div>
                <div>
                    <label htmlFor='inventory'>Inventory</label>
                    <input name='checkbox' onChange={handleCheck} type='radio' className='subobject-radio' id='inventory' value={'inventory'} />
                </div>
            </div>
        </div>
    )
}