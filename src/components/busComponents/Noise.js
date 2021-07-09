import React, { useState, useEffect } from 'react'
import SoundAndLightCard from '../SoundAndLightCard/SoundAndLightCard'

const Noise = ({ noise_sensor }) => {

    const [soundCreated,setSoundCreated]=useState();
    const[soundVal,setSoundVal]=useState();
    const[lightCreated,setLightCreated]=useState();
    const[lightVal,setLightVal]=useState();

    useEffect(() => {
         if (noise_sensor) {
            setSoundCreated(noise_sensor[4].created_at)
            setSoundVal(noise_sensor[4].value)
            setLightCreated(noise_sensor[2].created_at)
            setLightVal(noise_sensor[2].value)
        }
    })
    let noiseValue = {
        createdAt: soundCreated,
        value: soundVal
    }
    let lightValue = {
        createdAt: lightCreated,
        value: lightVal
    }
    console.log(noiseValue)
    return (
        <SoundAndLightCard
            noise={noiseValue}
            light={lightValue}
        />
    )
}

export default Noise