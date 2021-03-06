import React,{ Component } from 'react';
import './default/style.css';
import { Lang } from '../public/resource';
// import PageStart from './start';
import BarTitle from '../component/barTitle';
// import AddGateNextStep from './addGateNextStep';
import { connect } from 'react-redux';
import SystemApi from '../jssdk/system';

class Addgateway extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.systemApi = new SystemApi;
        this.handleClickBack = this.handleClickBack.bind(this);
    };
    
    nextPage(){
    		//this.props.history.push('/device/selectWifi');
        //this.props.history.push('/gateway/searchGW');
        // this.props.history.push('/gateway/customRoom');
        const path = {
					pathname: `/device/selectWifi`,
					query: {
						searchType: "AP"
					},
				};
				window.globalState.deviceType = 'gateway';
		  	this.props.history.push(path);
    };
    handleClickBack(event){
        this.props.history.goBack();
        // this.props.history.push('');
    };
    componentDidMount(){
        this.systemApi.offGoBack().onceGoBack(this.handleClickBack);
    }
    render (){
        return (
            <div className='addGateWay'>
                <BarTitle onBack={this.handleClickBack} title={Lang.gateway.apGateway.title} />
                <div className='way-step1'>
                    
                    <p className='power-tip'>{Lang.gateway.apGateway.tips[1]}</p>
                    <div className='add-ap-gateway2'></div>
                    <button onClick={()=> this.nextPage()} className="step-next">{Lang.gateway.nextstep}</button>
                </div>
            </div>
        )
    }
}
export default connect()(Addgateway)