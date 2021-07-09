import React, { useState, useEffect } from 'react'
import Eco2Card from '../Eco2Card/Eco2Card'

const Eco2 = ({ eco2_sensor }) => {

    const [created,setCreated]=useState();
    const[val,setVal]=useState();
    const[update,setUpdate]=useState();
    const[id,setId]=useState();


    useEffect(() => {
         if (eco2_sensor) {
            setCreated(eco2_sensor[1].created_at)
            setVal(eco2_sensor[1].value)
            setUpdate(eco2_sensor[1].updated_at)
            setId(eco2_sensor[1].id)
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
        <Eco2Card
            className="aqi-background"
            reading={reading}
        />
    )
}

export default Eco2