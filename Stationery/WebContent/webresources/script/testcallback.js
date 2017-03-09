var tmp=0;
function testBeforeSaveCallBack(pageid,reportid,dataObjArr)
{
	alert('将保存页面ID:::'+pageid+';;;报表ID:::'+reportid);
	printSavingData(dataObjArr);
	tmp++;
	if(tmp%2===0)
	{
		alert('本次中断保存数据操作');
		return WX_SAVE_TERMINAT;
	}
	alert('本次执行保存数据操作');
	return WX_SAVE_CONTINUE;
}

function testAfterSaveCallback(paramsObj)
{
	alert('已保存的页面ID:::'+paramsObj.pageid+';;;报表ID:::'+paramsObj.reportid);
	var reportguid=getComponentGuidById(paramsObj.pageid,paramsObj.reportid);
	var dataObjArr=WX_ALL_SAVEING_DATA[reportguid];//得到已保存的数据
	printSavingData(dataObjArr);
}

function printSavingData(dataObjArr)
{
	var dataObjTmp;
	for(var i=0;i<dataObjArr.length;i++)
	{
		dataObjTmp=dataObjArr[i];
		alert('本条记录的操作类型：'+dataObjTmp['WX_TYPE']);
		var rowdata='';
		for(var key in dataObjTmp)
		{
			rowdata=rowdata+key+':::'+dataObjTmp[key]+';;;';
		}
		alert(rowdata);
		//dataObjTmp['age']='100';
	}
}


/*function myrefresh(pageid,componentid)
{
    var btn1 = document.getElementById("btn_dealReportPage_guid_common_vpanel_confirm_id");
    var btn2 = document.getElementById("refresh_auditing");
		  $(function(){
			  $("#btn_dealReportPage_guid_common_vpanel_confirm_id").click(function(){
					try{
						saveEditableReportData(
								{pageid:'dealReportPage',savingReportIds:[{reportid:'report1',updatetype:'save'}]}
								)
						}catch(e){
							logErrorsAsJsFileLoad(e);
							}
						setTimeout(function(){artDialog.close();}, 1300);
			  })
			    $("#btn_yj_dealReportPage_guid_common_vpanel_confirm_id").click(function(){
					try{
						saveEditableReportData(
								{pageid:'yj_dealReportPage',savingReportIds:[{reportid:'report1',updatetype:'save'}]}
								)
						}catch(e){
							logErrorsAsJsFileLoad(e);
							}
						setTimeout(function(){artDialog.close();}, 1300);
			  })
		  });
}*/

/*function refresh_auditing(pageid,componentid){
	$("#btn_auditing_guid_common_vpanel_refresh_id").trigger("click");
	
}*/

function testonload(pageid,componentid)
{
	alert('加载完页面ID：'+pageid+'；组件ID：'+componentid);
}

function testDynamicOnload(paramsObj)
{
	alert('动态添加的onload提示信息：\n加载完页面ID：'+paramsObj.pageid+'；\n报表ID：'+paramsObj.reportid+'；\n提示信息：'+paramsObj.message);
}

function validateRedundantboxpage1BirthdayInput(pageid,reportid,dataObjArr)
{
	for(var i=0;i<dataObjArr.length;i++)
	{
		dataObjTmp=dataObjArr[i];
		if(dataObjTmp['WX_TYPE']=='delete') continue;//当前是在做删除操作
		var birthday=dataObjTmp['birthday'];
		var birthday2=dataObjTmp['birthday2'];
		if(birthday!=birthday2)
		{//两次输入的出生日期不一致
			wx_alert('保存时两次输入的出生日期不一致');
			return WX_SAVE_TERMINAT;
		}
	}
	return WX_SAVE_CONTINUE;
}

function testBeforeSearch(pageid,reportid,searchurl)
{
	alert('执行查询数据的URL：'+searchurl);
	//开发人员可以修改这里的URL中的参数，然后返回修改后的URL。如果返回null，则中断本次查询操作
	return searchurl;
}
function addNewRowCallback(trObj)
{
	alert('新增的记录行ID：'+trObj.getAttribute('id'));
}

function testConfigLinkedChart2(paramsObj)
{
	alert('显示的图表ID：'+paramsObj.chartid+'；图形对象：'+paramsObj.chartObj+'；自定义参数：[param1='+paramsObj.customizeData.param1+';param2='+paramsObj.customizeData.param2+']');
}
var popup_flag=-1;
function popupcallbackmethod(url)
{
	alert('      测试弹出回调函数\n\r弹出URL：'+url);
	popup_flag++;
	if(popup_flag%2==0)
	{
		alert('本次阻止弹出!!!');
		return null;
	}else
	{
		alert('本次执行弹出...');
		return url;
	}
}