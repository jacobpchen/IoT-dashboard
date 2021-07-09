import React, { useState, useEffect } from 'react'
import TvocCard from '../TvocCard/TvocCard'

const Tvoc = ({ tvoc_sensor }) => {

    const [created,setCreated]=useState();
    const[val,setVal]=useState();
    const[update,setUpdate]=useState();
    const[id,setId]=useState();


    useEffect(() => {
         if (tvoc_sensor) {
            setCreated(tvoc_sensor[0].created_at)
            setVal(tvoc_sensor[0].value)
            setUpdate(tvoc_sensor[0].updated_at)
            setId(tvoc_sensor[0].id)
        }
    })
    let reading = {
        createdAt: created,
        value: val ,
        updated_at: update,
        id:id
    }
    console.log(reading)
    return (
        <TvocCard
            className="aqi-background"
            reading={reading}
        />
    )
}

export default Tvoc