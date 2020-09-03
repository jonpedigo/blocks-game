import React from 'react'
import Select from 'react-select'
import classnames from 'classnames'

function NextSelect({sequenceItem, nextOptions, nextValue, onChange, title, isTrigger}) {
  if(isTrigger) return null

  const selectedNext = nextOptions.filter((option) => {
    if(option.value === nextValue) return true
  })[0]

  return <div className="SequenceItem__next">{title || 'Next:'}<Select
    value={selectedNext}
    onChange={onChange}
    options={nextOptions}
    styles={window.reactSelectStyle}
    theme={window.reactSelectTheme}/></div>
}

function SingleEventSelect({sequenceItem, valueProp, onChange, title}) {
  return <div className="SequenceItem__test">{title || 'Event: '}<Select
    value={{ value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
    onChange={onChange}
    options={Object.keys(window.triggerEvents).map(eventName => { return { value: eventName, label: eventName}})}
    styles={window.reactSelectStyle}
    theme={window.reactSelectTheme}/>
  </div>
}

function MultiTagSelect({sequenceItem, valueProp, onChange, title}) {
  return <div className="SequenceItem__test">{title || 'Test Tags:'}<Select
    value={sequenceItem[valueProp] && sequenceItem[valueProp].map((tags) => { return { value: tags, label: tags} })}
    onChange={onChange}
    options={Object.keys(window.allTags).map(tag => { return { value: tag, label: tag}})}
    styles={window.reactSelectStyle}
    isMulti
    theme={window.reactSelectTheme}/>
  </div>
}

function MultiIdSelect({sequenceItem, valueProp, onChange, title}) {
  return <div className="SequenceItem__test">{title || 'Test Ids:'}<Select
    value={sequenceItem[valueProp] && sequenceItem[valueProp].map((id) => { return {value: id, label: id} })}
    onChange={onChange}
    options={GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))}
    styles={window.reactSelectStyle}
    isMulti
    theme={window.reactSelectTheme}/>
  </div>
}

function SingleIdSelect({sequenceItem, valueProp, onChange, title, isTrigger}) {
  const options = [{value: 'default', label: 'default'}, {value: 'mainObject', label: 'mainObject'}, {value: 'guestObject', label: 'guestObject'}, ...GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))]
  if(isTrigger) {
    options.unshift({value: 'ownerObject', label: 'ownerObject'})
  }

  return <div className="SequenceItem__test">{title || 'Test Ids:'}<Select
    value={{value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
    onChange={onChange}
    options={options}
    styles={window.reactSelectStyle}
    theme={window.reactSelectTheme}/>
  </div>
}

function SingleTagSelect({sequenceItem, valueProp, onChange, title}) {
  return <div className="SequenceItem__test">{title || 'Test Tags:'}<Select
    value={{ value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
    onChange={onChange}
    options={Object.keys(window.allTags).map(tag => { return { value: tag, label: tag}})}
    styles={window.reactSelectStyle}
    theme={window.reactSelectTheme}/>
  </div>
}

function SingleLibraryObjectSelect({sequenceItem, valueProp, onChange, title}) {
  return <div className="SequenceItem__test">{title || 'Library Object Name'}<Select
    value={{ value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
    onChange={onChange}
    options={Object.keys(window.objectLibrary).map(objectName => { return { value: objectName, label: objectName }})}
    styles={window.reactSelectStyle}
    theme={window.reactSelectTheme}/>
  </div>
}

export {
  SingleEventSelect,
  SingleTagSelect,
  SingleIdSelect,
  SingleLibraryObjectSelect,
  MultiIdSelect,
  MultiTagSelect,
  NextSelect,
}
