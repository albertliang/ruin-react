import React from 'react'
import s from './FooterNav.module.css'
import {Nav} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {IoLogoGameControllerB, IoMdClock} from 'react-icons/io'
import exclamation from '../../assets/img/exclamation-triangle-solid.svg'
import {MdPeople, MdPerson} from 'react-icons/md'
import {GoGear} from 'react-icons/go'


type FooterNavProps= {
    isAuth: boolean,
    hasAvail: boolean,
    hasGames: boolean,
}

const FooterNav: React.FC<FooterNavProps> = React.memo(({isAuth, hasAvail, hasGames}) => {
    if(!isAuth)
        return null

    return (
        <div className={s.footer_nav}>
            <div className={s.navbar}>
                <div className={s.nav}>
                    <div className={s.navListItem}>
                        <Nav.Link as={Link} to="/availability" className={s.navText}>
                            <IoMdClock className={s.navIcon} />
                            Availability
                        </Nav.Link>
                        {!hasAvail &&
                        <img src={exclamation} className={s.navIconAlert}/>
                        }
                    </div>
                    <div className={s.navListItem}>
                        <Nav.Link as={Link} to="/games" className={s.navText}>
                            <IoLogoGameControllerB className={s.navIcon} />
                            Games
                        </Nav.Link>
                        {!hasGames &&
                        <img src={exclamation} className={s.navIconAlert}/>
                        }
                    </div>
                    <div className={s.navListItem}>
                        <Nav.Link as={Link} to="/friends" className={s.navText} >
                            <MdPerson className={s.navIcon} />
                            Friends
                        </Nav.Link>
                    </div>
                    <div className={s.navListItem}>
                        <Nav.Link as={Link} to="/groups" className={s.navText}>
                            <MdPeople className={s.navIcon} />
                            Groups
                        </Nav.Link>
                    </div>
                    <div className={s.navListItem}>
                        <Nav.Link as={Link} to="/profile" className={s.navText}>
                            <GoGear className={s.navIcon} />
                            Account
                        </Nav.Link>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default FooterNav