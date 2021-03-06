import React, {
	Component
} from 'react';
import BarTitle from '../component/barTitle';
import ScrollView from '../component/scrollView';
import { showDialog, selectTab } from '../action';
import SystemApi from '../jssdk/system';
import { Lang } from '../public';
import { connect } from 'react-redux';
import './default/style.css';
import './default/refreshstyle.css';
import ReactDOM from 'react-dom';
import PullToRefresh from 'antd-mobile/lib/pull-to-refresh';
import 'antd-mobile/lib/pull-to-refresh/style/css';
import { fetchDevActivity,deleteDevActivity,shouldUpdateRefresh} from '../action/device';
import Cookies from 'universal-cookie';
import { bindActionCreators } from 'redux';
import Toast from 'antd-mobile/lib/toast';


function dedupe(array){
	  return Array.from(new Set(array)); 
} 
  
function GetDateStr(AddDayCount) { 
	var dd = new Date(); 
	dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
	var y = dd.getFullYear(); 
	var m = dd.getMonth()+1;//获取当前月份的日期 
	var d = dd.getDate(); 
	return y+"-"+(m > 9?m : "0"+m)+"-"+(d > 9?d : "0"+d); 
	} 

var currentdate = GetDateStr(0);
var yesterday = GetDateStr(-1);
console.log(currentdate)
class Refresh extends React.Component {

	cookies = new Cookies();
	constructor(props) {
		super(props);
		
		this.state = {
			refreshing: false,
			down: true,
			height: document.documentElement.clientHeight-100,
			newData: [],
			showNoData:false,
			showErrorResult:true,
		};
		this.systemApi = new SystemApi;
		this.handleDelete = this.handleDelete.bind(this);
		this.handleClickBack = this.handleClickBack.bind(this);
	}
	
	getDeviceRecord(offset){
		const { deviceItem ,actions} = this.props;
		var request = {
			cookieUserId: this.cookies.get('userId'),
			cookieUserToken:this.cookies.get("accessToken"),
			devId: this.props.match.params.devId || deviceItem.devId,
			pageSize:  15 ,
		    offset:offset ,
		
		};
	
		actions.fetchDevActivity(request);
	}
	componentWillReceiveProps(nextProps){
		if(!nextProps.isFteaching){
			Toast.hide();
			if(nextProps.resultStatus){
				this.setState({
					showNoData:true
				})
			}else{
				if(this.state.showErrorResult){
					Toast.info("获取记录失败",2)
					this.setState({
						showErrorResult:false
					})
				}
			
			}
		}
	}
	componentWillMount() {
		console.log("执行-----componentWillMount")
		Toast.loading("",10,()=>{
			this.setState({
				showErrorResult:false
			})
			});	
		this.getDeviceRecord(1)
		}
	componentDidMount(){
			this.systemApi.offGoBack().onceGoBack(this.handleClickBack);
		// 	const hei = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
        //    setTimeout(() => this.setState({
        //       height: hei,
        //        }), 0);
		   }
	handleClickBack(event) {
		this.props.history.goBack();
		const {
			actions
		} = this.props;	
		actions.shouldUpdateRefresh();
	}

	handleDelete(event) {
		console.log("delete data")
		const {dataList} = this.props;   
		let that = this;
		if(dataList.length == 0){
			Toast.info(Lang.device.record.noData,2);
			return;
		
		}
		that.props.showDialog("", Lang.public.dialog.tip[2], [{
				text: Lang.public.dialog.button[0],
				handleClick: function() {
					this.hide();
				}
			},
			{
				text: Lang.public.dialog.button[5],
				className: "btn-split",
				handleClick: function() {
					this.hide();
					Toast.loading('', 0);
					var delRequest = {
					cookieUserId: that.cookies.get('userId'),
					cookieUserToken:that.cookies.get("accessToken"),
					devId: that.props.deviceItem.devId,
					};
					
					const {
						actions
					} = that.props;	

					actions.deleteDevActivity(delRequest);
				
					that.props.selectTab('device');
					setTimeout(() => {
					const {deleteDeviceRecordError} = that.props;	
					if(Object.keys(deleteDeviceRecordError).length != 0){
						Toast.info(deleteDeviceRecordError.res,2);
					}else{
						that.getDeviceRecord(1);
						this.setState({newData:[]},()=>{
							that.state.newData = []
							});
					}
						Toast.hide();
					  }, 2000);

				}
			}
		]);
	}

	render() {
		console.log("执行-----render")
		var data = [];
	    console.log("newData开始长度"+this.state.newData.length)
		const {dataList, dataCount,devicePageNum,shouldUpdateRefresh} = this.props; 
		console.log("dataList开始长度"+dataList.length)
		if(shouldUpdateRefresh){
			this.state.newData =dedupe( this.state.newData.concat(dataList));  
		}
		console.log("newData后来长度"+this.state.newData.length)
		var timeArray = [];
		this.state.newData.map((item, index) =>
		{
		let timeString= item.time;
		if(timeString != '{}'){
			timeArray.push(timeString.split(" ")[0])
		}
	
	  })
		var newTimeArr = dedupe(timeArray);
		for(var i = 0; i< newTimeArr.length; i++){
			var firstArray = [];
			var time= newTimeArr[i];
			data.push({type:1,des:time});
					
			this.state.newData.map((item, index) =>{
			var c =  item.time.split(" ")[0];
			if(c == time){
			firstArray.push(item)
			}
		}
		)	
		
		firstArray.map((item, index) =>{
			data.push({type:0,des:item.time.split(" ")[1],title:item.activity,last:(index == (firstArray.length-1) ? 1 : 0)});
		}
		)
	   }		

		
		
		return(
		<div><BarTitle onBack={this.handleClickBack}  onDelete={this.handleDelete}  title={Lang.device.record.title}/>
		<div  className = "refresh_main">
		{this.state.showNoData ? <div style = {{display: (this.state.newData.length === 0 ? "" : "none"),color:"#FFFFFF",paddingTop:"200px", textAlign:"center"}}>{Lang.setting.activity.empty}</div> :""}
		
       <PullToRefresh
        ref={el => this.ptr = el}
        style={{
          height: this.state.height,
          overflow: 'auto',
		}}
		distanceToRefresh = {window.devicePixelRatio * 25}
        indicator={{ activate: 'refresh', deactivate:'down', release: 'release', finish:'finish' }}
        direction= "up"
        refreshing={this.state.refreshing}
        onRefresh={() => {
		  this.setState({ refreshing: true });
		  console.log("单个设备的第二次")
		  if(devicePageNum < dataCount){
			this.getDeviceRecord(devicePageNum+1)
		  }
		 
          setTimeout(() => {
			this.setState({ refreshing: false });
			console.log("finish ")
          }, 2000);
        }}
      >
        {data.map((item, index) => (
        <div key= {index}>
        
          <div   style={{display: (item.type=== 1 ? "" :  "none")}}  className ='day-item' >
		      <div style={{float:'left',marginTop:30,fontSize:"18px",color: '$text-color'}}>{item.des == currentdate ? "Today" : (item.des == yesterday ? "Yesterday" :item.des)} </div> 
         </div>
        
       <section  style={{display: (item.type === 0 ? "" :  "none")}}   id= {item.last  === 1 ?"":"cd-timeline"}  className="cd-container">
		     <div className="cd-timeline-img "    ></div>    
	              <div className="refresh-item">
		            <span className = "title-item">{item.title} </span> 
		           <span  style={{float:"right",fontFamily:"PingFangSC-Regular",fontSize:"14px",	color:"$text-weaken-color"}}> {item.des} </span>
                  </div>
       </section>
             
         </div>  
        )
        )}
      </PullToRefresh>
	  </div>
    </div>);
	}
}

//将state绑定到props
const mapStateToProps = (state, ownProps) => {
	console.log("---state--")
	console.log(state)
	console.log("===state==")
	const currentDevId = ownProps.match.params.devId;
	return {
		devId:currentDevId,
		selectedTab: state.other.selectedTab,
		dataList:state.device.deviceRecord,
		dataCount:state.device.deviceRecordCount,
		devicePageNum:state.device.devicePageNum,
		deviceItem:state.device.deviceItem,
		shouldUpdateRefresh:state.device.shouldUpdateRefresh,
		fetchDeviceRecordError:state.device.fetchDeviceRecordError,
		deleteDeviceRecordError:state.device.deleteDeviceRecordError,
		isFteaching:state.device.isFteaching,
		resultStatus:state.device.resultStatus,
	}
};
//将action的所有方法绑定到props上
const mapDispatchToProps = (dispatch) => {
	return {
		actions: bindActionCreators({fetchDevActivity,deleteDevActivity,shouldUpdateRefresh}, dispatch),
		selectTab: (...args) => dispatch(selectTab(...args)),
		showDialog: (...args) => dispatch(showDialog(...args))
	}
	
};

export default connect(mapStateToProps, mapDispatchToProps)(Refresh);