import React from 'react'
import s from './preloader.module.css'
import loaderImg from '../../assets/img/loader.svg'

const Preloader = () => {
    return (
        <div className={s.preloader}><img src={loaderImg} alt="Loading ..."/></div>
    )
}

export default Preloader