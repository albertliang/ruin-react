import s from './Availability.module.css'
import React, {MouseEvent, createRef} from 'react'
import {
    PageModalButtons,
    PageModalContent,
    PageModalHeader,
} from '../../components/pageModal/PageModal'
import * as Constants from "../../constants";
import {authenticationService as auth} from '../../services/authentication.service';
import axios from 'axios';

interface GridProps {
    time: string,
    handleClose: any,
    history: any
    isAuth: boolean
}

interface GridState {
    isHeldDown: boolean,
    startID: string,
    startColor: string,
    selectBox: any,
    selected: Array<string>,
    oldSelected: Array<string>,
    isLoading: boolean,
}


//these a some functions take from the server to convert between timezones
//is it worth making a new endpoint to get this out of user model?
let moment = require('moment-timezone')
// const headerOptions = auth.getHeaderOptions();

function LocalTimeInc30Offset(localTimezone: string, localDate?: Date): number {
    return Math.floor(moment(localDate).tz(localTimezone)._offset / 30)
}

function UTC30AvailToLocal(localTimezone: string, dayOfWeek: number, timeInc30: number) {
    let offset = LocalTimeInc30Offset(localTimezone)
    //console.log(offset)
    timeInc30 += offset
    if (timeInc30 < 0) {
        timeInc30 += 48
        dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    } else if (timeInc30 > 47) {
        timeInc30 -= 48
        dayOfWeek = dayOfWeek === 6 ? 0 : dayOfWeek + 1
    }
    return {d: dayOfWeek, t: timeInc30}
}

class Grid extends React.Component <GridProps, GridState> {
    constructor(props: Readonly<GridProps>) {
        super(props)

        this.state = {
            isHeldDown: false,
            startID: "",
            startColor: "",
            selectBox: {},
            selected: [],
            oldSelected: [],
            isLoading: true,
        }
        this.gridItemClick = this.gridItemClick.bind(this)
        this.mouseDown = this.mouseDown.bind(this)
        this.mouseUp = this.mouseUp.bind(this)
        this.mouseOver = this.mouseOver.bind(this)
        this.GenerateBoxes = this.GenerateBoxes.bind(this)
        this.GridRow = this.GridRow.bind(this)
        this.reset = this.reset.bind(this)
        this.saveAll = this.saveAll.bind(this)

    }

    private myRef = createRef<HTMLDivElement>()

    async componentDidMount() {

        if(!this.props.isAuth){
            this.props.history.push("/login");
        }else{

            let avArr: number[] = []
            let timezone: string = ''
            let url = Constants.APIURL + "/api/gamer/avail/"

            const headerOptions = auth.getHeaderOptions();
            const response = await axios.get(url, headerOptions);
            let temp = response.data;
            avArr = temp.availsArr

            let url2 = Constants.APIURL + "/api/users/me/"
            const response2 = await axios.get(url2, headerOptions );
            temp = response2.data;
            timezone = temp.timezone

            let servState: Array<string> = []
            try {
                for (const item of avArr) {
                    let day = Math.floor(item / 48)
                    let timeinc = Math.round(((item / 48) % 1) * 48)
                    //console.log(day + ":" + timeinc)
                    let tuple = UTC30AvailToLocal(timezone, day, timeinc)
                    let id: string = tuple.d.toString() + '/' + tuple.t.toString()
                    servState.push(id)
                }
            } catch (exception) {
                //If we hit this, it means we couldn't contact db
                //Maybe have this redirect or display some error message
            }
            //console.log(servState)
            this.setState(() => ({
                selected: servState,
                oldSelected: servState,
                isLoading: false
            }))

            const boxes = Array.from(this.myRef.current!.getElementsByClassName('box'))
            for (const box of boxes) {
                if (this.state.selected.includes(box.id)) {
                    box.setAttribute('style', 'background-color : #51bcda')
                    // box.classList.add(s.active)
                }
            }


        }



    }

    async gridItemClick(e: MouseEvent){

        //shouldn't touch the state, should change color of block and then immediately do a single save/remove call
        let elem = e.currentTarget;
        const headerOptions = auth.getHeaderOptions();
        let url = Constants.APIURL + "/api/gamer/avail/"
        if(elem.getAttribute("style") ==="background-color : white;" || elem.getAttribute("style")===null){
            elem.setAttribute("style", "background-color : #51bcda")
            try {
                await axios.put(url + elem.id, null, headerOptions );
            }catch(e){}
        }
        else{
            elem.setAttribute("style", "background-color : white;")
            try {
                await axios.delete(url + elem.id, headerOptions );
            }catch(e){}

        }

    }

    mouseDown(e:MouseEvent){
        //need to do the following, make a box when we from click to release
        //calculate which squares fall in the box
        //find a way to access and manipulate those squares
        e.persist()
        //add another thing to this thats a flag to see what the current color is
        // use that to determine what mouseover will do
        let id = e.currentTarget.id;
        let color = e.currentTarget.getAttribute("style");
        if(color === null)
            color = "background-color : white;"
        this.setState(() => ({
            isHeldDown: true,
            startID: id,
            startColor: color
        }))

    }


    mouseUp(e:MouseEvent){
        const action = this.state.startColor;
        this.setState( () => ({
            isHeldDown: false,
            startID: "",
            startColor: ""
        }))
        const boxes =  Array.from(this.myRef.current!.getElementsByClassName("hot"));

        for (const box of boxes) {
            box.setAttribute("class", "box")
        }
        //commented out until backend works...may still be adjusted tho
        if(this.state.startColor === "background-color : white;")
            this.saveAll()

        else this.removeSelection()

    }

    mouseOver(e:MouseEvent){
        /*
        * use mouse over while mouse down
        * repeatedly calculate everything in range based on our current box
        *  since it is possible to get id of the current moused over element, and we can store the initial one
        * we should be able to get an array of boxes between the two and then run the select thing without saving
        * on all of them
        * then on mouse up stop firing this event and save
        */
        if(this.state.isHeldDown){
            let currId = e.currentTarget.id
            let arr = currId.split("/")
            let arr2 = this.state.startID.split("/")
            //if our current day is less than the start, swap them
            if (Number(arr[0]) < Number(arr2[0]) ){
                var x = arr2[0]
                arr2[0] = arr[0]
                arr[0] = x
            }

            if(Number(arr[1]) <  Number(arr2[1])){
                x = arr2[1]
                arr2[1] = arr[1]
                arr[1] = x
            }

            var idArr: any[] = []
            //timeinc (vertical)
            let temp = ""


            for( let i =Number(arr2[1]); i <= Number(arr[1]); i++){
                //day (horizontal)
                for( let j=Number(arr2[0]); j <= Number(arr[0]); j++){
                    temp = j + "/" + i
                    idArr.push(temp)
                }
            }

            const boxes =  Array.from(this.myRef.current!.getElementsByClassName("box"));
            // console.log(this.state.startColor)
            // console.log(boxes)
            if(this.state.startColor === "background-color : white;"){
                for (const box of boxes) {
                    if(idArr.includes(box.id)){

                        box.setAttribute("style", "background-color : #51bcda;")
                        box.setAttribute("class", "hot box")

                    }
                    else if(box.getAttribute("class").includes("hot")){
                        box.setAttribute("style","background-color : white;")
                        box.setAttribute("class", "box")
                    }
                }
            }
            else {
                for (const box of boxes) {
                    if(idArr.includes(box.id)){

                        box.setAttribute("style", "background-color : white;")

                        //box.setAttribute("class", "hot box")

                    }
                    // else if(box.getAttribute("class").includes("hot")){
                    //   box.setAttribute("style","background-color : lightgreen")
                    //   box.setAttribute("class", "box")
                    // }
                }
            }



        }

        this.setState( () => ({
            selected: idArr
        }))


    }

    GridRow(time: string, timeInc: number) { //returns  [HH:MM aa, | Box 1, ......, Box 7 ]
        let row: JSX.Element[] = [<th key={time}>{time}</th>]
        for (let i = 0; i < 7; i++)
            row.push(<td key={`${i}/${timeInc}`}>
                <button onClick={this.gridItemClick}
                        onMouseOver={this.mouseOver}
                        onMouseDown={this.mouseDown}
                        onMouseUp={this.mouseUp}
                        className="box"
                        id={`${i}/${timeInc}`}
                />
            </td>)
        return (<tr key={time+''+timeInc}>{row}</tr>)
    }


    GenerateBoxes() {
        //&nbsp; is space char
        const allTimes = ['12:00', '12:30', '1:00', '1:30', '2:00', '2:30',
            '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30',
            '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30',
            '11:00', '11:30']


        const items = []

        for (const val of allTimes) {
            items.push(this.GridRow(val + 'AM', allTimes.indexOf(val)))
        }
        for (const val of allTimes) {
            items.push(this.GridRow(val + 'PM', allTimes.indexOf(val) + 24))
        }
        return items
    }

    //Changed this to save on each press
    /*There is a known issue with remove right now:
    * if you refresh the page quickly enough after hitting reset,
    * not all the avails will be done calling removeAvail in the backend..
    * The fix for this would be to add a new backend function for removeAll, to be more performant.
    */
    async removeAll() {

        let avArr: number[] = []
        let timezone: string = ''
        let url = Constants.APIURL + "/api/gamer/avail/"
        const headerOptions = auth.getHeaderOptions();

        const response = await axios.get(url, headerOptions );
        let temp = response.data;
        avArr = temp.availsArr;

        let url2 = Constants.APIURL + "/api/users/me/"
        const response2 = await axios.get(url2, headerOptions );
        temp = response2.data;
        timezone = temp.timezone;


        let servState: Array<string> = []
        try {
            for (const item of avArr) {
                var day = Math.floor(item / 48)
                var timeinc = Math.round(((item / 48) % 1) * 48)
                //console.log(day + ":" + timeinc)
                var tuple = UTC30AvailToLocal(timezone, day, timeinc)
                var id: string = tuple.d.toString() + '/' + tuple.t.toString()
                servState.push(id)
            }
        } catch (exception) {
            //If we hit this, it means we couldn't contact db
            //Maybe have this redirect or display some error message
        }
        //console.log(servState)
        this.setState(() => ({
            oldSelected: servState
        }))

        //if an item in the old set of selected times is NOT in the current, remove them
        try {
            for (const item of this.state.oldSelected) {

                await axios.delete(url + item, headerOptions );
            }
            this.setState(() => ({
                oldSelected: []
            }))
        } catch (e) {
            //if oldSelected is never set (some kind of inital server error) then we can't do anything here
        }
    }

    async removeSelection() {
        const headerOptions = auth.getHeaderOptions();
        let url = Constants.APIURL + "/api/gamer/avail/"
        try {
            for (const item of this.state.selected) {
                // if(!this.state.oldSelected.includes(item)){
                await axios.delete(url + item, headerOptions);
                //console.log(this.state)
                //}
            }
        } catch (e) {
            //we only get here when there's server issues
        }
        // window.location.reload();
        // window.scrollTo(0, 0)

    }

    //If an item in the new set is not in the old
    async saveAll() {
        const headerOptions = auth.getHeaderOptions();
        let url = Constants.APIURL + "/api/gamer/avail/"
        try {
            for (const item of this.state.selected) {
                await axios.put(url + item, null, headerOptions);
            }
            this.setState(() => ({
                oldSelected: this.state.selected
            }))
        } catch (e) {
            //we only get here when there's server issues
        }
        // window.location.reload();
        // window.scrollTo(0, 0)

    }

    async reset(e: MouseEvent) {

        await this.setState(() => ({
            selected: []
        }))
        const boxes = Array.from(this.myRef.current!.getElementsByClassName('box'))
        for (const box of boxes) {
            box.setAttribute('style', 'background-color : white;')
        }
        await this.removeAll()
        window.scrollTo(0, 0)
    }


    render() {
        if(!this.props.isAuth)
            return null

        return (

            <div className="tourAvailability">
                <PageModalHeader title={'Availability'} handleClose={this.props.handleClose} preloader={this.state.isLoading}  >
                    <div className={s.tableHeaderOther}>Click-drag to select your available times</div>
                    <PageModalButtons
                        buttons={[
                            {
                                title: 'Reset',
                                type: 'common',
                                handleClick: this.reset
                            }
                        ]}
                    />
                </PageModalHeader>

                <PageModalContent>
                    <div className={s.tableContainer} ref={this.myRef} onMouseUp={this.mouseUp}>
                        <table className={s.tableHeader}>
                            <tbody>
                                <tr>
                                    <th/>
                                    <td>Sun</td>
                                    <td>Mon</td>
                                    <td>Tue</td>
                                    <td>Wed</td>
                                    <td>Thu</td>
                                    <td>Fri</td>
                                    <td>Sat</td>
                                </tr>
                            </tbody>
                        </table>

                        <table className={s.tableContent}>
                            <tbody>
                                {this.GenerateBoxes()}
                            </tbody>
                        </table>

                    </div>
                </PageModalContent>
            </div>
        )
    }

}



export default Grid
  