import React, { useState, useEffect } from 'react'
import ParticalMatterCard from '../ParticalMatterCard/ParticalMatterCard';

const Pm2_5 = ({ pm2_5_sensor }) => {

    const [created,setCreated]=useState();
    const[val,setVal]=useState();
    const[update,setUpdate]=useState();
    const[id,setId]=useState();


    useEffect(() => {
         if (pm2_5_sensor) {
            setCreated(pm2_5_sensor[8].created_at)
            setVal(pm2_5_sensor[8].value)
            setUpdate(pm2_5_sensor[8].updated_at)
            setId(pm2_5_sensor[8].id)
        }
    })
    let reading = {
        createdAt: created,
        value: val ,
        updated_at: update,
        id: id
    }
    console.log(reading)
    return (
        <ParticalMatterCard   
            className="aqi-background"
            reading={reading}
        />
    )
}

export default Pm2_5