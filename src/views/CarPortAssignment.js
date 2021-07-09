import React, { Component } from 'react';
import Authentication from '../Authentication';
import { Card, CardBody, CardHeader, Collapse, ListGroup, ListGroupItem, CardDeck} from 'reactstrap';
import { Button } from 'reactstrap';
import SelectSearch from 'react-select-search';
import {Service} from '../services/Service';
import LoadingCard from "../LoadingCard";
import MessageCard from "../MessageCard";

class CarPortAssignment extends Component {
  componentDidMount(){
    this.setState({openIndex: 0, backendData: {}, users: [], auth: Authentication.getBearerAuthHeader(), isLoading: false, failedToLoad: false, searchValue: null});
    this.setState({isLoading: true});
    this.loadData().then(
        () => {this.setState({isLoading:false, failedToLoad: false})},
        () => {this.setState({isLoading: false, failedToLoad: true})}   //if error, set failedToLoad
    )
  }
  async loadData(){
      var assignableLocations;
      var userData;
      var roles;
      try{
          roles = await Authentication.getUserRoles();
          if(roles !== undefined && roles.indexOf('admins')>-1){
                assignableLocations = await Service.getAssignableLocations();
                userData = await Service.getUsers();
                this.setState({isAdmin: true});
                this.setState({backendData: assignableLocations})
                for(let location in assignableLocations.locations){
                    this.setState({[assignableLocations.locations[location].locationId] : assignableLocations.locations[location].assignedUser});
                
                    //this code would allow us to remove users from the 'add user' list when they're added to current users (still WIP, but unimplemented for now)
                    /*const currentOptions = [{name: "", value:""}];
                    for(var i in this.state.users){
                        if(!this.state.backendData.locations[location].assignedUser.includes(this.state.users[i].userId)){
                            //console.log(this.state.users[i].username);
                            currentOptions.push({
                                name: this.state.users[i].username,
                                value: this.state.users[i].userId
                            });
                        }
                    }
                    this.state.options[this.state.backendData.locations[location].locationId] = currentOptions;*/
                }

                //sets state.users to user data retrieved from Service.getUsers
                this.setState({users: userData});
                //reformats user data to fit React-Select-Search requirements
                this.setState({userParams: userData.map((user)=>{return({name:user.userName, value:user.userId})})});
          }
          else{
              this.setState({isAdmin:false});
          }
      }
      catch(error){
        console.error(error);
      }
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  toggle = (index) => {
      if(this.state.openIndex === index){
          this.setState({openIndex: 0});
      }
      else{
          this.setState({openIndex: index});
      }
  };
    
  renderAccordionMenu(){
      var locations = this.state && this.state.backendData.locations !== undefined ? this.state.backendData.locations : [];
      return locations.map((location) => {
          let locationIdentifier;
          if(location.locationName){
              locationIdentifier = location.locationName;
          }
          else{locationIdentifier = location.locationId}
          return(
            <Card key={location.locationId}>
                <CardHeader onClick={()=>{this.toggle(location.locationId)}}>{locationIdentifier}</CardHeader>
                    <Collapse isOpen={this.state.openIndex === location.locationId}>
                    <CardBody>
                        {this.renderLocationData(location)}
                    </CardBody>
                    </Collapse>
            </Card>
          )
      })
  }
  renderLocationData(location){
        
        return(
            <CardDeck>
                <Card>
                    <CardHeader>
                        Currently Assigned Users
                    </CardHeader>
                    <ListGroup>
                        {//view current users, with 'delete' button for each user
                            this.state[location.locationId].map((userId) =>{
                                const userName = this.getUserName(userId);
                                return(
                                    <ListGroupItem key={userId + location.locationId}>
                                        {userName}
                                        <Button className="float-right" onClick={()=>this.removeUser(location.locationId, userId)}>Remove User</Button>
                                    </ListGroupItem>
                                )
                            })
                        }
                    </ListGroup>
                </Card>
                <Card>
                    <CardHeader>
                        Assign New User
                    </CardHeader>
                    <SelectSearch options={this.state.userParams} value={this.state.searchValue} search={true} placeholder="Search Users" onChange={(value)=>this.addUser(location.locationId, value)} />
                </Card>
            </CardDeck>
        )
        
  }
  getUserName(userId){
      if(this.state.users === undefined){
          return null;
      }
        for(var i in this.state.users){
            if(this.state.users[i].userId === userId){
                return this.state.users[i].userName;
            }
        }
  }
  addUser(locationId, userId){
      if(!userId) return;

      this.setState({searchValue:""});

      if(this.state[locationId].includes(userId)){
          //i have no idea why this works and simply setting it to null does not
          if(this.state.searchValue == null){
            this.setState({searchValue:""});
          }
          else this.setState({searchValue:null});
          return;
      }
      
      Service.addUserToLocation(userId, locationId).then(()=>{
          //if successful
          this.setState(prevState => ({[locationId]: [...prevState[locationId], userId], searchValue:null}));
      }, (error)=>{
          //on failure, log to console and reload data
          console.error('failed to add user');
          console.error(error);
          this.loadData().then(
              ()=>{console.log('data reloaded')},
              ()=>{this.setState({failedToLoad:true})}
          )
      })
  }
  removeUser(locationId, userId){
        Service.removeUserFromLocation(userId, locationId).then(()=>{
            //on success
            this.setState((prevState) =>{
                const arr = prevState[locationId];
                const index = arr.indexOf(userId);
                if(index !== -1){
                    arr.splice(index, 1);
                    return {[locationId]: arr};
                }
            })
        }, (error)=>{
            //on failure, log to console and reload data
            console.error('failed to remove user');
            console.error(error);
            this.loadData.then(
                ()=>{console.log('data reloaded')},
                ()=>{this.setState({failedToLoad:true})}
            )
        })
        
  }
  render() {
    if(this.state?.isLoading){
        return(<LoadingCard/>)
    }else if(this.state?.failedToLoad){
        return (
            <MessageCard title={"Failed to load, please try again later."} message={""}/>
        )
    } else if (this.state?.isAdmin){
        return (
          <Card>
              <CardHeader>Assign Users to Carports</CardHeader>
              <CardBody>
                  {this.renderAccordionMenu()}
              </CardBody>
          </Card>
        )
    } else {
        return(
            <MessageCard title={"Warning: Unauthorized User"} message={"If you believe you have reached this page in error, please contact your administrator."}/>                
        )
    }
  }
}


export default CarPortAssignment