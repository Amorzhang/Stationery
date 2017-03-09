var WX_GUID_SEPERATOR = "_guid_";
var ISOPERA = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
var isChrome = (navigator.userAgent.indexOf("Chrome") !== -1);
var isIE = (navigator.userAgent.toLowerCase().indexOf("msie") != -1);
var WX_UPDATE_ALLDATA;
var WX_showProcessingBar = true;
var WX_serverUrl;
var WX_refreshActionParamsMap;
function refreshComponent(b, c, d) {
	if (b == null || b == "") {
		return
	}
	var a = b.indexOf("&WX_ISSERVERCONFIRM=true");
	if (a > 0) {
		b = b.substring(0, a)
				+ b.substring(a + "&WX_ISSERVERCONFIRM=true".length);
		WX_serverUrl = b;
		loadPage("ok")
	} else {
		WX_refreshActionParamsMap = d;
		WX_serverUrl = paramdecode(b);
		WX_serverUrl = replaceUrlParamValue(WX_serverUrl, "WX_ISAJAXLOAD",
				"true");
		if (!isHasIgnoreReportsSavingData(WX_serverUrl, c)) {
			loadPage("ok")
		} else {
			/*wx_confirm(
					"\u662f\u5426\u653e\u5f03\u5bf9\u62a5\u8868\u6570\u636e\u7684\u4fee\u6539\uff1f",
					null, null, null, loadPage)*/
			loadPage("ok")
		}
	}
}
function loadPage(e) {
	if (!wx_isOkConfirm(e)) {
		return false
	}
	var b = WX_serverUrl;
	var d = new Object();
	d.serverUrl = b;
	d.refreshActionParamsMap = WX_refreshActionParamsMap == null ? new Object()
			: WX_refreshActionParamsMap;
	var a = getParamValueFromUrl(b, "PAGEID");
	if (a == "") {
		wx_warn("\u5728URL\u4e2d\u6ca1\u6709\u53d6\u5230PAGEID\uff0c\u65e0\u6cd5\u52a0\u8f7d");
		return
	}
	d.pageid = a;
	var g = getParamValueFromUrl(b, "refreshComponentGuid");
	if (g == null || g == "") {
		g = a
	} else {
		if (g.indexOf("[OUTERPAGE]") == 0) {
			b = replaceUrlParamValue(b, "refreshComponentGuid", null);
			b = replaceUrlParamValue(b, "WX_ISOUTERPAGE", "true")
		}
	}
	d.refreshComponentGuid = g;
	var h = getParamValueFromUrl(b, "SLAVE_REPORTID");
	d.slave_reportid = h;
	var f = b.split("?");
	if (f == null || f.length <= 1) {
		f[1] = ""
	} else {
		if (f.length > 2) {
			for (var c = 2; c < f.length; c = c + 1) {
				f[1] = f[1] + "?" + f[c]
			}
		}
	}
	if (WX_showProcessingBar) {
		displayLoadingMessage(getRealRefreshPageId(a, g))
	}
	WX_showProcessingBar = true;
	XMLHttpREPORT.sendReq("POST", f[0], f[1], callBack, onErrorMethod, d);
	closeAllColFilterResultSpan()
}
var responseStateCode = {
	NONREFRESHPAGE : 0,
	FAILED : -1,
	SUCCESS : 1
};
var wx_request_responseResultData = null;
var wx_isSuccessResponse;
function callBack(n, a) {
	var c = a.pageid;
	var k = a.refreshComponentGuid;
	hideLoadingMessage(getRealRefreshPageId(c, k));
	WX_showProcessingBar = true;
	var g = n.responseText;
	var d = a.serverUrl;
	var o = parseTagContent(g, "<RESULTS_INFO-" + c + ">", "</RESULTS_INFO-"
			+ c + ">");
	var i = null;
	if (o != null && o.length == 2) {
		i = o[0];
		g = o[1]
	}
	var j = getObjectByJsonString(i);
	if (j == null) {
		wx_error("\u66f4\u65b0\u9875\u9762\u6570\u636e\u5931\u8d25");
		return
	}
	if (j.confirmessage != null && j.confirmessage != "") {
		WX_serverconfirm_key = j.confirmkey;
		WX_serverconfirm_url = j.confirmurl;
		wx_confirm(j.confirmessage, null, null, null, okServerConfirm,
				cancelServerConfirm);
		return
	}
	var m = null;
	if (k.indexOf("[DYNAMIC]") == 0) {
		k = j.dynamicRefreshComponentGuid;
		m = j.dynamicSlaveReportId
	} else {
		m = a.slave_reportid
	}
	if (m != null && m != "") {
		k = getComponentGuidById(c, m)
	}
	var f = k;
	if (f.indexOf("[OUTERPAGE]") == 0) {
		f = f.substring("[OUTERPAGE]".length);
		k = c
	}
	wx_isSuccessResponse = j.statecode != responseStateCode.FAILED
			&& (j.errormess == null || j.errormess == "");
	if (wx_isSuccessResponse === true
			&& j.statecode != responseStateCode.NONREFRESHPAGE) {
		var p = document.getElementById("WX_CONTENT_" + f);
		if (p == null) {
			wx_error("\u66f4\u65b0\u9875\u9762\u5931\u8d25");
			return
		}
		processAllListReportDataRowsBeforeRefreshPage(a.serverUrl,
				a.refreshActionParamsMap);
		if (f != k) {
			if (p.outerHTML != null && p.outerHTML != undefined) {
				p.outerHTML = g
			} else {
				p.innerHTML = g
			}
		} else {
			var e = '<div id="WX_CONTENT_' + k + '">';
			var h = "</div>";
			var l = g.indexOf(e);
			if (l >= 0) {
				g = g.substring(l + e.length);
				l = g.lastIndexOf(h);
				if (l > 0) {
					g = g.substring(0, l)
				}
			}
			p.innerHTML = g
		}
		if (m == null || m == "") {
			var b = document.getElementById(c + "_url_id");
			b.setAttribute("value", j.pageurl);
			if (j.pageEncodeUrl != null && j.pageEncodeUrl != "") {
				b.setAttribute("encodevalue", j.pageEncodeUrl)
			}
		}
	}
	wx_request_responseResultData = new Object;
	wx_request_responseResultData.requestDataObj = a;
	wx_request_responseResultData.responseDataObj = j;
	callback_alert()
}
function getRealRefreshPageId(a, b) {
	if (b != null && b.indexOf("[OUTERPAGE]") == 0) {
		return b.substring("[OUTERPAGE]".length)
	}
	return a
}
var WX_serverconfirm_key = null;
var WX_serverconfirm_url = null;
function okServerConfirm(a) {
	if (!wx_isOkConfirm(a)) {
		cancelServerConfirm()
	} else {
		refreshComponent(WX_serverconfirm_url + "&" + WX_serverconfirm_key
				+ "=true&WX_ISSERVERCONFIRM=true")
	}
}
function cancelServerConfirm() {
	refreshComponent(WX_serverconfirm_url + "&" + WX_serverconfirm_key
			+ "=false&WX_ISSERVERCONFIRM=true")
}
function callback_alert() {
	var e = wx_request_responseResultData.responseDataObj.alert;
	if (e == null || e.length == 0) {
		callback_success()
	} else {
		var d, b;
		for (var c = 0, a = e.length; c < a; c++) {
			d = e[c].message;
			b = e[c].popupparams;
			if (c == a - 1) {
				if (WXConfig.prompt_dialog_type == "ymprompt") {
					if (b == null) {
						b = new Object()
					}
					b.handler = callback_success;
					wx_alert(d, b)
				} else {
					wx_alert(d, b);
					callback_success()
				}
			} else {
				wx_alert(d, b)
			}
		}
	}
}
function callback_success() {
	var c = wx_request_responseResultData.responseDataObj.success;
	if (c == null || c.length == 0) {
		callback_warn()
	} else {
		var e, b;
		for (var d = 0, a = c.length; d < a; d++) {
			e = c[d].message;
			b = c[d].popupparams;
			if (d == a - 1) {
				if (WXConfig.prompt_dialog_type == "ymprompt") {
					if (b == null) {
						b = new Object()
					}
					b.handler = callback_warn;
					wx_success(e, b)
				} else {
					wx_success(e, b);
					callback_warn()
				}
			} else {
				wx_success(e, b)
			}
		}
	}
}
function callback_warn() {
	var c = wx_request_responseResultData.responseDataObj.warn;
	if (c == null || c.length == 0) {
		callback_error()
	} else {
		var e, b;
		for (var d = 0, a = c.length; d < a; d++) {
			e = c[d].message;
			b = c[d].popupparams;
			if (d == a - 1) {
				if (WXConfig.prompt_dialog_type == "ymprompt") {
					if (b == null) {
						b = new Object()
					}
					b.handler = callback_error;
					wx_warn(e, b)
				} else {
					wx_warn(e, b);
					callback_error()
				}
			} else {
				wx_warn(e, b)
			}
		}
	}
}
function callback_error() {
	var e = wx_request_responseResultData.responseDataObj.error;
	if (e == null || e.length == 0) {
		doPostCallback()
	} else {
		var d, b;
		for (var c = 0, a = e.length; c < a; c++) {
			d = e[c].message;
			b = e[c].popupparams;
			if (c == a - 1) {
				if (WXConfig.prompt_dialog_type == "ymprompt") {
					if (b == null) {
						b = new Object()
					}
					b.handler = doPostCallback;
					wx_error(d, b)
				} else {
					wx_error(d, b);
					doPostCallback()
				}
			} else {
				wx_error(d, b)
			}
		}
	}
}
function doPostCallback() {
	var b = wx_request_responseResultData.responseDataObj;
	var c = b.updateReportGuids;
	if (wx_isSuccessResponse === true) {
		processAllListReportDataRowsAfterRefreshPage(c)
	}
	var e = b.onloadMethods;
	if (e && e != "") {
		var a;
		for (var d = 0; d < e.length; d = d + 1) {
			a = e[d];
			if (!a || !a.methodname) {
				continue
			}
			if (a.methodparams) {
				a.methodname(a.methodparams)
			} else {
				a.methodname()
			}
		}
	}
	if (wx_isSuccessResponse === true && c != null && c != "") {
		for (var d = 0; d < c.length; d = d + 1) {
			reportguidTmp = c[d].value;
			if (WX_ALL_SAVEING_DATA && WX_ALL_SAVEING_DATA[reportguidTmp]) {
				delete WX_ALL_SAVEING_DATA[reportguidTmp]
			}
		}
	}
}
function processAllListReportDataRowsBeforeRefreshPage(b, c) {
	var e = getAllRefreshReportIdsByRefreshUrl(b, false);
	if (e == null) {
		return
	}
	var a = getParamValueFromUrl(b, "PAGEID");
	var j, f, m;
	for ( var g in e) {
		if (g == null || g == "") {
			continue
		}
		f = getComponentGuidById(a, g);
		j = getReportMetadataObj(f);
		if (j == null) {
			continue
		}
		if (WX_Current_Slave_TrObj != null && WX_Current_Slave_TrObj[f] != null) {
			WX_Current_Slave_TrObj[f] = WX_Current_Slave_TrObj[f]
					.cloneNode(true);
			WX_Current_Slave_TrObj[f].setAttribute("wx_not_in_currentpage",
					"true")
		}
		if (c.keepSelectedRowsAction === true
				&& j.metaDataSpanObj.getAttribute("isSelectRowCrossPages") === "true"
				&& WX_selectedTrObjs != null) {
			m = WX_selectedTrObjs[f];
			if (m == null) {
				continue
			}
			var h = new Array();
			for ( var l in m) {
				if (m[l] == null || m[l].getAttribute("EDIT_TYPE") == "add") {
					h[h.length] = l
				} else {
					if (m[l].getAttribute("wx_not_in_currentpage") !== "true") {
						addAllColValuesToValueProperty(m[l]);
						m[l] = m[l].cloneNode(true);
						m[l].setAttribute("wx_not_in_currentpage", "true")
					}
				}
			}
			for (var d = 0; d < h.length; d++) {
				delete m[h[d]]
			}
		}
		if (c.keepSavingRowsAction === true
				&& WX_UPDATE_ALLDATA != null
				&& WX_UPDATE_ALLDATA[f] != null
				&& j.metaDataSpanObj.getAttribute("isEnableCrossPageEdit") === "true") {
			var k = WX_UPDATE_ALLDATA[f];
			for (var d = 0; d < k.length; d++) {
				trObjTmp = k[d];
				if (trObjTmp == null
						|| trObjTmp.getAttribute("EDIT_TYPE") == "add") {
					k.splice(d, 1)
				} else {
					if (trObjTmp.getAttribute("wx_not_in_currentpage") !== "true") {
						addAllColValuesToValueProperty(trObjTmp);
						k[d] = trObjTmp.cloneNode(true);
						k[d].setAttribute("wx_not_in_currentpage", "true")
					}
				}
			}
		}
	}
}
function addAllColValuesToValueProperty(d) {
	var b = d.getElementsByTagName("TD");
	if (b == null || b.length == 0) {
		return
	}
	for (var c = 0, a = b.length; c < a; c++) {
		b[c].setAttribute("value", wx_getColValue(b[c]))
	}
}
function processAllListReportDataRowsAfterRefreshPage(b) {
	if (b == null || b == "") {
		return
	}
	var h, m, g;
	var k = document;
	var e = wx_request_responseResultData.requestDataObj.refreshActionParamsMap;
	for (var f = 0; f < b.length; f = f + 1) {
		h = b[f].value;
		m = getReportMetadataObj(h);
		if (WX_UPDATE_ALLDATA != null && WX_UPDATE_ALLDATA[h] != null) {
			if (e.keepSavingRowsAction === true
					&& m.metaDataSpanObj.getAttribute("isEnableCrossPageEdit") === "true") {
				var n = WX_UPDATE_ALLDATA[h];
				for (var d = 0; d < n.length; d++) {
					g = n[d];
					if (g == null || g.getAttribute("EDIT_TYPE") == "add") {
						n.splice(d, 1)
					} else {
						var c = k.getElementById(g.getAttribute("id"));
						if (c != null
								&& c.getAttribute("global_rowindex") == g
										.getAttribute("global_rowindex")) {
							g.setAttribute("wx_not_in_currentpage", null);
							c.parentNode.replaceChild(g, c)
						}
					}
				}
			} else {
				delete WX_UPDATE_ALLDATA[h]
			}
		}
		if (WX_selectedTrObjs == null || WX_selectedTrObjs[h] == null) {
			selectDefaultSelectedDataRows(m)
		} else {
			if (e.keepSelectedRowsAction === true
					&& m.metaDataSpanObj.getAttribute("isSelectRowCrossPages") === "true") {
				selectDefaultSelectedDataRows(m);
				var a = WX_selectedTrObjs[h];
				for ( var l in a) {
					g = a[l];
					if (g == null
							|| g.getAttribute("wx_not_in_currentpage") !== "true") {
						continue
					}
					var c = k.getElementById(g.getAttribute("id"));
					if (c != null
							&& c.getAttribute("global_rowindex") == g
									.getAttribute("global_rowindex")) {
						doSelectListReportDataRow(m, c, false, true)
					}
				}
			} else {
				delete WX_selectedTrObjs[h];
				selectDefaultSelectedDataRows(m)
			}
		}
	}
}
function selectDefaultSelectedDataRows(c) {
	if (c == null) {
		return
	}
	var b = c.metaDataSpanObj.getAttribute("reportfamily");
	if (b == null || b.indexOf("list") < 0) {
		return
	}
	var g = document.getElementById(c.reportguid + "_data");
	if (g == null) {
		return
	}
	var e = c.metaDataSpanObj.getAttribute("rowselecttype");
	var f;
	if (e == WX_ROWSELECT_TYPE.single || e == WX_ROWSELECT_TYPE.radiobox
			|| e == WX_ROWSELECT_TYPE.single_radiobox) {
		for (var d = g.rows.length - 1; d >= 0; d--) {
			f = g.rows[d];
			if (f != null && f.getAttribute("default_rowselected") === "true") {
				doSelectListReportDataRow(c, f, true, true);
				break
			}
		}
	} else {
		if (e == WX_ROWSELECT_TYPE.multiple || e == WX_ROWSELECT_TYPE.checkbox
				|| e == WX_ROWSELECT_TYPE.multiple_checkbox) {
			for (var d = 0, a = g.rows.length; d < a; d++) {
				f = g.rows[d];
				if (f != null
						&& f.getAttribute("default_rowselected") === "true") {
					doSelectListReportDataRow(c, f, true, true)
				}
			}
		}
	}
}
function onErrorMethod(b, a) {
	hideLoadingMessage();
	if (true && !window.onbeforeunload) {
		window.onbeforeunload = function() {
			WXConfig.load_error_message = null
		}
	}
	if (WXConfig.load_error_message != null
			&& WXConfig.load_error_message != "") {
		wx_error(WXConfig.load_error_message)
	}
}
function isHasIgnoreReportsSavingData(b, p) {
	if (WX_UPDATE_ALLDATA == null || isEmptyMap(WX_UPDATE_ALLDATA)) {
		return false
	}
	var a = getParamValueFromUrl(b, "PAGEID");
	if (a == null || a == "") {
		return true
	}
	var k = getParamValueFromUrl(b, "refreshComponentGuid");
	var o = getParamValueFromUrl(b, "SLAVE_REPORTID");
	var h = getParamValueFromUrl(b, "WX_ISREFRESH_BY_MASTER");
	if (h === "true") {
		return false
	}
	var q = getAllRefreshReportIdsByRefreshUrl(b, true);
	if (p == null) {
		p = new Object()
	}
	var m = new Array();
	for ( var l in q) {
		if (p[l] == "true") {
			continue
		}
		m[m.length] = getComponentGuidById(a, l)
	}
	if (m.length == 0) {
		return false
	}
	for (var f = 0; f < m.length; f++) {
		var d = WX_UPDATE_ALLDATA[m[f]];
		if (d == null || d == "") {
			continue
		}
		var n = getComponentMetadataObj(m[f]);
		if (n != null
				&& n.metaDataSpanObj.getAttribute("checkdirtydata") == "false") {
			continue
		}
		if (WX_refreshActionParamsMap == null
				|| WX_refreshActionParamsMap.keepSavingRowsAction !== true) {
			return true
		}
		if (n == null
				|| n.metaDataSpanObj.getAttribute("isEnableCrossPageEdit") !== "true") {
			return true
		}
		try {
			for (var c = 0; c < d.length; c++) {
				if (d[c].getAttribute("EDIT_TYPE") == "add") {
					return true
				}
			}
		} catch (g) {
		}
	}
	return false
}
function getAllRefreshReportIdsByRefreshUrl(c, g) {
	var b = getParamValueFromUrl(c, "PAGEID");
	if (b == null || b == "") {
		return null
	}
	var h = getParamValueFromUrl(c, "refreshComponentGuid");
	var k = getParamValueFromUrl(c, "SLAVE_REPORTID");
	var a = new Array();
	var l = new Object();
	if (k != null && k != "") {
		l[k] = "true"
	} else {
		if (h.indexOf("[DYNAMIC]") == 0) {
			var f = h.substring("[DYNAMIC]".length);
			var e = f.split(";");
			for (var d = 0; d < e.length; d++) {
				if (e[d] == null || e[d] == "") {
					continue
				}
				var j = getComponentMetadataObj(getComponentGuidById(b, e[d]));
				if (j != null) {
					if (j.refreshComponentGuid == null
							|| j.refreshComponentGuid == "") {
						a[a.length] = getComponentGuidById(b, e[d])
					} else {
						a[a.length] = j.refreshComponentGuid
					}
				}
			}
		} else {
			if (h == null || h == "" || h.indexOf("[OUTERPAGE]") == 0) {
				a[a.length] = b
			} else {
				a[a.length] = h
			}
		}
		getAllRefreshReportids(b, a, l)
	}
	return l
}
function getAllRefreshReportids(d, a, p, l) {
	if (a == null || a.length == 0) {
		return
	}
	var c;
	for (var h = 0; h < a.length; h++) {
		c = a[h];
		var e = getComponentMetadataObj(c);
		if (e == null) {
			continue
		}
		if (e.componentTypeName == "application.report") {
			p[e.componentid] = "true";
			var o = e.metaDataSpanObj.getAttribute("dependingChildReportIds");
			if (l === true && o != null && o != "") {
				var m = o.split(";");
				for (var g = 0; g < m.length; g++) {
					if (m[g] == null || m[g] == "") {
						continue
					}
					p[m[g]] = "true";
					getAllInheritDependingChildReportIds(d, m[g], p)
				}
			}
		} else {
			var f = e.metaDataSpanObj.getAttribute("childComponentIds");
			if (f != null && f != "") {
				var b = f.split(";");
				for (var g = 0, k = b.length; g < k; g++) {
					if (b[g] == null || b[g] == "") {
						continue
					}
					var n = new Array();
					n[n.length] = getComponentGuidById(d, b[g]);
					getAllRefreshReportids(d, n, p, l)
				}
			}
		}
	}
}
function isHasIgnoreSlaveReportsSavingData(f) {
	if (WX_UPDATE_ALLDATA == null || isEmptyMap(WX_UPDATE_ALLDATA)) {
		return false
	}
	var b = getPageIdByComponentGuid(f);
	var d = getComponentIdByGuid(f);
	var a = new Object();
	getAllInheritDependingChildReportIds(b, d, a);
	var c;
	for ( var e in a) {
		c = getComponentGuidById(b, e);
		if (WX_UPDATE_ALLDATA[c] != null && WX_UPDATE_ALLDATA[c] != "") {
			return true
		}
	}
	return false
}
function getAllInheritDependingChildReportIds(a, c, h) {
	var b = getComponentGuidById(a, c);
	var f = getReportMetadataObj(b);
	if (f == null) {
		return
	}
	var g = f.metaDataSpanObj.getAttribute("dependingChildReportIds");
	if (g == null || g == "") {
		return
	}
	var e = g.split(";");
	for (var d = 0; d < e.length; d++) {
		if (e[d] == null || e[d] == "") {
			continue
		}
		h[e[d]] = "true";
		getAllInheritDependingChildReportIds(a, e[d], h)
	}
}
function searchReportData(l, k, w) {
	var h = getComponentGuidById(l, k);
	var o = getReportMetadataObj(h);
	var e = getComponentUrl(l, o.refreshComponentGuid, o.slave_reportid);
	if (e == null) {
		return
	}
	var c = document.getElementsByName("font_" + h + "_conditions");
	if (c != null) {
		var a, g, m, v, j;
		var d = getAllConditionValues(h);
		for (var p = 0, q = c.length; p < q; p = p + 1) {
			a = c[p];
			m = a.getAttribute("value_name");
			if (m == null || m == "") {
				continue
			}
			if (!validateConditionBoxValue(o, d, a, false)) {
				return
			}
			v = a.getAttribute("iteratorindex");
			if (v != null && v != "" && parseInt(v, 10) >= 0) {
				m = m + "_" + parseInt(v, 10)
			}
			g = d[m];
			if (g == null || g == "") {
				g = null
			}
			e = replaceUrlParamValue(e, m, g);
			var s = a.getAttribute("innerlogicid");
			if (s != null && s != "") {
				e = replaceUrlParamValue(e, s, getConditionSelectedValue(s, a
						.getAttribute("innerlogicinputboxtype")))
			}
			var t = a.getAttribute("columnid");
			if (t != null && t != "") {
				e = replaceUrlParamValue(e, t, getConditionSelectedValue(t, a
						.getAttribute("columninputboxtype")))
			}
			var f = a.getAttribute("valueid");
			if (f != null && f != "") {
				e = replaceUrlParamValue(e, f, getConditionSelectedValue(f, a
						.getAttribute("valueinputboxtype")))
			}
		}
	}
	e = removeReportNavigateInfosFromUrl(e, o, null);
	e = removeLazyLoadParamsFromUrl(e, o, true);
	var r = o.metaDataSpanObj.getAttribute("current_accessmode");
	if (r === WX_ACCESSMODE_ADD) {
		e = replaceUrlParamValue(e, k + "_ACCESSMODE", null)
	}
	e = replaceUrlParamValue(e, "SEARCHREPORT_ID", o.reportid);
	if (w != null) {
		for ( var u in w) {
			if (u == null) {
				continue
			}
			e = replaceUrlParamValue(e, u, w[u])
		}
	}
	var n = o.metaDataSpanObj.getAttribute("beforeSearchMethod");
	if (n != null && n != "") {
		var b = getObjectByJsonString(n);
		e = b.method(l, k, e);
		if (e == null || e == "") {
			return
		}
	}
	refreshComponent(e)
}
function removeReportConditionBoxValuesFromUrl(b, j) {
	var h = document.getElementsByName("font_" + j.reportguid + "_conditions");
	if (h == null || h.length == 0) {
		return b
	}
	var f = null;
	var g = null;
	var m = null;
	var k = null;
	for (var d = 0, e = h.length; d < e; d = d + 1) {
		f = h[d];
		m = f.getAttribute("value_name");
		if (m == null || m == "") {
			continue
		}
		k = f.getAttribute("iteratorindex");
		if (k != null && k != "" && parseInt(k, 10) >= 0) {
			m = m + "_" + parseInt(k, 10)
		}
		b = replaceUrlParamValue(b, m, null);
		var c = f.getAttribute("innerlogicid");
		if (c != null && c != "") {
			b = replaceUrlParamValue(b, c, null)
		}
		var l = f.getAttribute("columnid");
		if (l != null && l != "") {
			b = replaceUrlParamValue(b, l, null)
		}
		var a = f.getAttribute("valueid");
		if (a != null && a != "") {
			b = replaceUrlParamValue(b, a, null)
		}
	}
	return b
}
function getConditionSelectedValue(d, e) {
	if (e == "radiobox") {
		var c = document.getElementsByName(d);
		if (c != null) {
			for (var b = 0; b < c.length; b++) {
				if (c[b].checked) {
					return c[b].value
				}
			}
		}
	} else {
		var a = document.getElementById(d);
		if (a != null) {
			return a.options[a.options.selectedIndex].value
		}
	}
	return null
}
function getAllConditionValues(b) {
	var j = document.getElementsByName("font_" + b + "_conditions");
	if (j == null || j.length == 0) {
		return null
	}
	var g, h, c, f;
	var a = new Object();
	for (var d = 0, e = j.length; d < e; d++) {
		g = j[d];
		c = g.getAttribute("value_name");
		if (c == null || c == "") {
			continue
		}
		h = g.getAttribute("iteratorindex");
		if (h != null && h != "" && parseInt(h, 10) >= 0) {
			c = c + "_" + parseInt(h, 10)
		}
		f = wx_getConditionValue(g);
		if (f == null) {
			f = ""
		}
		a[c] = f
	}
	return a
}
function wx_setConditionValue(e, a) {
	var f = e.getAttribute("value_name");
	if (f == null || f == "") {
		return
	}
	e.setAttribute("value", a);
	var j = getWXInputBoxChildNode(e);
	if (j != null) {
		setInputBoxValue(j, a)
	}
	var b = getReportGuidByParentConditionFontObj(e);
	if (b != null && b != "") {
		var k = getReportMetadataObj(b);
		if (k == null) {
			return
		}
		var c = k.metaDataSpanObj.getAttribute(f + "_onsetvaluemethods");
		var l = getObjectByJsonString(c);
		if (l != null && l.methods != null) {
			var d = l.methods;
			if (d.length > 0) {
				for (var g = 0, h = d.length; g < h; g++) {
					d[g].method(e, a, null)
				}
			}
		}
	}
}
function wx_getConditionValue(f) {
	if (f == null) {
		return null
	}
	var c = getReportGuidByParentConditionFontObj(f);
	if (c == null || c == "") {
		return null
	}
	var d = f.getAttribute("value_name");
	if (d == null || d == "") {
		return null
	}
	var j = getWXInputBoxChildNode(f);
	var l = j == null ? f.getAttribute("value") : getInputBoxValue(j);
	var k = getReportMetadataObj(c);
	if (k != null) {
		var b = k.metaDataSpanObj.getAttribute(d + "_ongetvaluemethods");
		var a = getObjectByJsonString(b);
		if (a != null && a.methods != null) {
			var e = a.methods;
			if (e.length > 0) {
				for (var g = 0, h = e.length; g < h; g++) {
					l = e[g].method(f, l)
				}
			}
		}
	}
	return l
}
function getReportGuidByParentConditionFontObj(b) {
	if (b == null) {
		return null
	}
	var a = b.getAttribute("id");
	if (a == null || a.indexOf("font_") != 0 || a.indexOf("_conditions") <= 0) {
		return null
	}
	return a.substring("font_".length, a.lastIndexOf("_conditions"))
}
function navigateReportPage(e, l, a) {
	var n = getReportMetadataObj(getComponentGuidById(e, l));
	var c = n.metaDataSpanObj.getAttribute("navigate_reportid");
	var d = getComponentUrl(e, n.refreshComponentGuid, n.slave_reportid);
	d = replaceUrlParamValue(d, c + "_PAGENO", a);
	var o = n.metaDataSpanObj.getAttribute("dependingChildReportIds");
	var h = n.metaDataSpanObj.getAttribute("reportfamily");
	if (o != null && o != "" && (h == null || h.indexOf("list") < 0)) {
		var g = o.split(";");
		var b;
		for (var j = 0, k = g.length; j < k; j = j + 1) {
			b = g[j];
			if (b == null || b == "") {
				continue
			}
			var f = getReportMetadataObj(getComponentGuidById(e, b));
			if (f == null) {
				continue
			}
			d = removeReportNavigateInfosFromUrl(d, f, null)
		}
	}
	var m = h == null || h.indexOf("list") >= 0;
	refreshComponent(d, null, {
		keepSelectedRowsAction : m,
		keepSavingRowsAction : m
	})
}
function removeReportNavigateInfosFromUrl(c, n, e) {
	if (e != 2) {
		var b = n.metaDataSpanObj.getAttribute("navigate_reportid");
		if (b != null && b != "") {
			c = replaceUrlParamValue(c, b + "_PAGENO", null);
			c = replaceUrlParamValue(c, b + "_PAGECOUNT", null);
			c = replaceUrlParamValue(c, b + "_RECORDCOUNT", null)
		}
	}
	if (e != 1) {
		var j = n.metaDataSpanObj
				.getAttribute("relateConditionReportNavigateIds");
		if (j != null && j != "") {
			var k = j.split(";");
			var m;
			for (var h = 0; h < k.length; h = h + 1) {
				m = k[h];
				if (m == null || m == "") {
					continue
				}
				c = replaceUrlParamValue(c, m + "_PAGENO", null);
				c = replaceUrlParamValue(c, m + "_PAGECOUNT", null);
				c = replaceUrlParamValue(c, m + "_RECORDCOUNT", null)
			}
		}
		var l = n.metaDataSpanObj.getAttribute("dependingChildReportIds");
		var g = n.metaDataSpanObj.getAttribute("reportfamily");
		if (l != null && l != "" && (g == null || g.indexOf("list") < 0)) {
			var f = l.split(";");
			var a;
			for (var h = 0; h < f.length; h = h + 1) {
				a = f[h];
				if (a == null || a == "") {
					continue
				}
				var d = getReportMetadataObj(getComponentGuidById(n.pageid, a));
				if (d == null) {
					continue
				}
				c = removeReportNavigateInfosFromUrl(c, d, e)
			}
		}
	}
	return c
}
var WX_SCROLL_DELAYTIME = 50;
function showComponentScroll(a, c, b) {
	if (c != null && isWXNumber(c)) {
		c = c + "px"
	}
	if (typeof (fleXenv) == "undefined") {
		wx_error("\u6846\u67b6\u6ca1\u6709\u4e3a\u6b64\u9875\u9762\u5bfc\u5165/webresources/scroll/scroll.js\u6587\u4ef6\uff0c\u8bf7\u5728\uff1cpage/\uff1e\u7684js\u5c5e\u6027\u4e2d\u663e\u5f0f\u5bfc\u5165");
		return false
	}
	if (b == 11) {
		setTimeout(function() {
			showComponentVerticalScroll("vscroll_" + a, c)
		}, WX_SCROLL_DELAYTIME)
	} else {
		if (b == 12) {
			setTimeout(function() {
				showComponentHorizontalScroll("hscroll_" + a)
			}, WX_SCROLL_DELAYTIME)
		} else {
			if (b == 13) {
				showComponentVerticalScroll("vscroll_" + a, c);
				showComponentHorizontalScroll("hscroll_" + a)
			} else {
				if (b == 21) {
					setTimeout(function() {
						showComponentVerticalScroll("scroll_" + a, c)
					}, WX_SCROLL_DELAYTIME)
				} else {
					if (b == 22) {
						setTimeout(function() {
							showComponentHorizontalScroll("scroll_" + a)
						}, WX_SCROLL_DELAYTIME)
					} else {
						if (b == 23) {
							setTimeout(function() {
								showComponentAllScroll("scroll_" + a, c)
							}, WX_SCROLL_DELAYTIME)
						}
					}
				}
			}
		}
	}
}
function showComponentVerticalScroll(a, b) {
	if (!b || parseInt(b) <= 0) {
		return false
	}
	var c = document.getElementById(a);
	if (!c) {
		return false
	}
	if (c.scrollHeight > parseInt(b)) {
		c.style.height = b;
		fleXenv.fleXcrollMain(c);
		document.getElementById(a + "_hscrollerbase").className = "hscrollerbase_hidden";
		c.fleXcroll.updateScrollBars()
	} else {
		c.style.height = c.scrollHeight + "px"
	}
}
function showComponentHorizontalScroll(a) {
	var b = document.getElementById(a);
	if (!b) {
		return false
	}
	b.style.height = (b.scrollHeight + 15) + "px";
	fleXenv.fleXcrollMain(b);
	document.getElementById(a + "_vscrollerbase").className = "vscrollerbase_hidden";
	b.fleXcroll.updateScrollBars()
}
function showComponentAllScroll(a, b) {
	if (!b || parseInt(b) <= 0) {
		return false
	}
	var c = document.getElementById(a);
	if (!c) {
		return false
	}
	if (c.scrollHeight > parseInt(b)) {
		c.style.height = b
	} else {
		c.style.height = (c.scrollHeight + 15) + "px"
	}
	fleXenv.fleXcrollMain(c);
	c.fleXcroll.updateScrollBars()
}
function initRowSelect() {
	if (WX_selectedTrObjs == null) {
		WX_selectedTrObjs = new Object()
	}
}
var WX_selectedTrObj_temp;
var WX_shouldInvokeOnloadMethod_temp;
function doSelectReportDataRowImpl(d) {
	if (!wx_isOkConfirm(d)) {
		return
	}
	var e = WX_selectedTrObj_temp;
	var a = WX_shouldInvokeOnloadMethod_temp;
	WX_selectedTrObj_temp = null;
	WX_shouldInvokeOnloadMethod_temp = null;
	if (e == null || e.getAttribute("disabled_rowselected") == "true") {
		return
	}
	var f = e.getAttribute("id");
	if (f == null || f == "") {
		return
	}
	var c = f.substring(0, f.lastIndexOf("_tr_"));
	if (c == "") {
		return
	}
	var b = getReportMetadataObj(c);
	if (b == null) {
		return
	}
	doSelectListReportDataRow(b, e, a, true)
}
function doSelectListReportDataRow(c, d, b, h) {
	if (c == null || d.getAttribute("disabled_rowselected") == "true") {
		return
	}
	var e = c.metaDataSpanObj.getAttribute("rowselecttype");
	if (e == null || WX_ROWSELECT_TYPE.alltypes[e.toLowerCase()] !== true) {
		return
	}
	if (e == WX_ROWSELECT_TYPE.checkbox || e == WX_ROWSELECT_TYPE.radiobox
			|| e == WX_ROWSELECT_TYPE.multiple_checkbox
			|| e == WX_ROWSELECT_TYPE.single_radiobox) {
		var a = null;
		if (e == WX_ROWSELECT_TYPE.checkbox
				|| e == WX_ROWSELECT_TYPE.multiple_checkbox) {
			a = getSelectCheckBoxObj(d)
		} else {
			a = getSelectRadioBoxObj(d)
		}
		if (a == null) {
			return
		}
		a.checked = true;
		doSelectedDataRowChkRadio(a, b == true ? "true" : "false", h)
	} else {
		if (!isListReportDataTrObj(d)) {
			return
		}
		initRowSelect();
		var g = null;
		if (e == WX_ROWSELECT_TYPE.single) {
			g = deselectAllDataRow(c)
		}
		selectDataRow(c, d);
		if (b == true) {
			var f = new Array();
			f[0] = d;
			g = getRealDeselectedTrObjs(f, g);
			invokeRowSelectedMethods(c, f, g)
		}
	}
}
function doDeselectReportDataRowImpl(f) {
	if (!wx_isOkConfirm(f)) {
		return
	}
	var e = WX_selectedTrObj_temp;
	var h = WX_shouldInvokeOnloadMethod_temp;
	WX_selectedTrObj_temp = null;
	WX_shouldInvokeOnloadMethod_temp = null;
	if (e == null || e.getAttribute("disabled_rowselected") == "true") {
		return
	}
	var d = e.getAttribute("id");
	if (d == null || d == "") {
		return
	}
	var b = d.substring(0, d.lastIndexOf("_tr_"));
	var i = getReportMetadataObj(b);
	if (i == null) {
		return
	}
	if (!isSelectedRowImpl(b, e)) {
		return
	}
	var g = getRowSelectType(b);
	if (g == null || WX_ROWSELECT_TYPE.alltypes[g.toLowerCase()] !== true) {
		return
	}
	if (g == WX_ROWSELECT_TYPE.checkbox
			|| g == WX_ROWSELECT_TYPE.multiple_checkbox) {
		var c = getSelectCheckBoxObj(e);
		if (c == null) {
			return
		}
		c.checked = false;
		doSelectedDataRowChkRadio(c, h == true ? "true" : "false", true)
	} else {
		deselectDataRow(i, e);
		if (g == WX_ROWSELECT_TYPE.radiobox
				|| g == WX_ROWSELECT_TYPE.single_radiobox) {
			var c = getSelectRadioBoxObj(e);
			if (c != null) {
				c.checked = false
			}
		}
		if (h == true) {
			var a = new Array();
			a[0] = e;
			invokeRowSelectedMethods(i, null, a)
		}
	}
}
var WX_selected_selecttype_temp;
function doSelectDataRowEvent(i) {
	var a = i || window.event;
	var e = a.srcElement || a.target;
	var g = getSelectedTrParent(e);
	if (g == null || g.getAttribute("disabled_rowselected") == "true") {
		return
	}
	var f = g.getAttribute("id");
	var b = f.substring(0, f.lastIndexOf("_tr_"));
	var h = getReportMetadataObj(b);
	if (h == null) {
		return
	}
	var d = h.metaDataSpanObj.getAttribute("rowselecttype");
	if (d == WX_ROWSELECT_TYPE.multiple_checkbox
			|| d == WX_ROWSELECT_TYPE.single_radiobox) {
		if (e.getAttribute("name") == b + "_rowselectbox_col") {
			return
		}
		var c = null;
		if (d == WX_ROWSELECT_TYPE.multiple_checkbox) {
			c = getSelectCheckBoxObj(g);
			if (c == null) {
				return
			}
			if (c.checked == true) {
				c.checked = false
			} else {
				c.checked = true
			}
		} else {
			c = getSelectRadioBoxObj(g);
			if (c == null || c.checked == true) {
				return
			}
			c.checked = true
		}
		doSelectedDataRowChkRadio(c, true, false)
	} else {
		WX_selectedTrObj_temp = g;
		if (isHasIgnoreSlaveReportsSavingData(b)) {
			wx_confirm(
					"\u672c\u64cd\u4f5c\u53ef\u80fd\u4f1a\u4e22\u5931\u5bf9\u4ece\u62a5\u8868\u6570\u636e\u7684\u4fee\u6539\uff0c\u662f\u5426\u7ee7\u7eed\uff1f",
					null, null, null, doSelectDataRowEventImpl)
		} else {
			doSelectDataRowEventImpl("ok")
		}
	}
}
function doSelectDataRowEventImpl(f) {
	if (!wx_isOkConfirm(f)) {
		return
	}
	var d = WX_selectedTrObj_temp;
	WX_selectedTrObj_temp = null;
	if (d.getAttribute("disabled_rowselected") == "true") {
		return
	}
	var e = d.getAttribute("id");
	var b = e.substring(0, e.lastIndexOf("_tr_"));
	var h = getReportMetadataObj(b);
	if (h == null) {
		return
	}
	var g = h.metaDataSpanObj.getAttribute("rowselecttype");
	initRowSelect();
	var i = new Array();
	var a = new Array();
	if (g == WX_ROWSELECT_TYPE.single) {
		a = deselectAllDataRow(h);
		selectDataRow(h, d);
		i[i.length] = d;
		a = getRealDeselectedTrObjs(i, a)
	} else {
		var j = WX_selectedTrObjs[b];
		var c = getSelectedTrObjGuid(h, d);
		if (c == null) {
			return
		}
		if (j != null && j[c] != null) {
			deselectDataRow(h, d);
			a[a.length] = d
		} else {
			selectDataRow(h, d);
			i[i.length] = d
		}
	}
	invokeRowSelectedMethods(h, i, a)
}
var WX_selected_selectBoxObj_temp;
function doSelectedDataRowChkRadio(b, d, g) {
	var f = b.type;
	var h = b.checked;
	if (f != "radio" && f != "RADIO" && f != "checkbox" && f != "CHECKBOX") {
		return
	}
	var c = b.getAttribute("name");
	var a = c.lastIndexOf("_rowselectbox_col");
	if (a <= 0) {
		return
	}
	var e = c.substring(0, a);
	if (e == null || e == "") {
		return
	}
	WX_selected_selectBoxObj_temp = b;
	WX_shouldInvokeOnloadMethod_temp = d;
	if (g !== true && isHasIgnoreSlaveReportsSavingData(e)) {
		wx_confirm(
				"\u672c\u64cd\u4f5c\u53ef\u80fd\u4f1a\u4e22\u5931\u5bf9\u4ece\u62a5\u8868\u6570\u636e\u7684\u4fee\u6539\uff0c\u662f\u5426\u7ee7\u7eed\uff1f",
				null, null, null, doSelectedDataRowChkRadioImpl,
				cancelSelectDeselectChkRadio)
	} else {
		doSelectedDataRowChkRadioImpl("ok")
	}
}
function cancelSelectDeselectChkRadio() {
	if (WX_selected_selectBoxObj_temp == null) {
		return
	}
	if (WX_selected_selectBoxObj_temp.checked) {
		WX_selected_selectBoxObj_temp.checked = false
	} else {
		WX_selected_selectBoxObj_temp.checked = true
	}
	WX_selected_selectBoxObj_temp = null
}
function doSelectedDataRowChkRadioImpl(m) {
	if (!wx_isOkConfirm(m)) {
		wx_callCancelEvent();
		return
	}
	var l = WX_selected_selectBoxObj_temp;
	var t = WX_shouldInvokeOnloadMethod_temp;
	WX_selected_selectBoxObj_temp = null;
	WX_shouldInvokeOnloadMethod_temp = null;
	var i = l.type;
	var f = l.checked;
	initRowSelect();
	var o = new Array();
	var b = new Array();
	var s = l.getAttribute("name");
	var n = s.lastIndexOf("_rowselectbox_col");
	if (n <= 0) {
		return
	}
	var d = s.substring(0, n);
	if (d == null || d == "") {
		return
	}
	var q = getReportMetadataObj(d);
	if (q == null) {
		return
	}
	var k;
	var u;
	var c = l.getAttribute("rowgroup");
	if (c == "true") {
		var a = getTreeGroupRowObj(d, l);
		if (a == null) {
			return
		}
		selectChildDataRows(q, a, o, b, f);
		var p = a.getAttribute("id");
		var n = p.lastIndexOf("trgroup_");
		k = p.substring(0, n);
		u = a.getAttribute("parenttridsuffix")
	} else {
		var g = getSelectedTrParent(l);
		if (g == null || g.getAttribute("disabled_rowselected") == "true") {
			return
		}
		var v = g.getAttribute("id");
		if (i == "radio" || i == "RADIO") {
			b = deselectAllDataRow(q);
			selectDataRow(q, g);
			o[o.length] = g
		} else {
			if (f) {
				selectDataRow(q, g);
				o[o.length] = g
			} else {
				deselectDataRow(q, g);
				b[b.length] = g
			}
			var n = v.lastIndexOf("tr_");
			k = v.substring(0, n);
			u = g.getAttribute("parenttridsuffix")
		}
	}
	if (i == "checkbox" || i == "CHECKBOX") {
		var s = l.getAttribute("name");
		var n = s.lastIndexOf("_col");
		if (n <= 0) {
			return
		}
		var h = s.substring(0, n);
		var r = document.getElementsByName(h);
		if (r && r.length > 0) {
			var e = r[0];
			if (e != null) {
				var j = WX_selectedTrObjs[d];
				if (j == null || isEmptyMap(j)) {
					e.checked = false
				} else {
					e.checked = true
				}
			}
		}
		if (u != null && u != "") {
			selectParentDataRows(k, u, f)
		}
	}
	if (!t || t != "false") {
		b = getRealDeselectedTrObjs(o, b);
		invokeRowSelectedMethods(q, o, b)
	}
}
function getTreeGroupRowObj(c, d) {
	var b = d.parentNode;
	while (b != null) {
		if (b.tagName == "TR") {
			var a = b.getAttribute("id");
			if (a != null && a.indexOf(c) >= 0 && a.indexOf("_trgroup_") > 0) {
				break
			}
		}
		b = b.parentNode
	}
	return b
}
function selectChildDataRows(p, b, m, d, f) {
	var o = b.getAttribute("id");
	var k = o.lastIndexOf("trgroup_");
	var h = o.substring(0, k);
	var g = b.getAttribute("childdataidsuffixes");
	var t = document;
	if (g && g != "") {
		var e = g.split(";");
		for (var r = 0, s = e.length; r < s; r = r + 1) {
			var q = e[r];
			if (q == null || q == "") {
				continue
			}
			var l = t.getElementById(h + q);
			if (l == null || l.getAttribute("disabled_rowselected") == "true") {
				continue
			}
			var n = getSelectCheckBoxObj(l);
			var c = n.checked;
			if (f) {
				n.checked = true;
				selectDataRow(p, l);
				if (!c) {
					m[m.length] = l
				}
			} else {
				n.checked = false;
				deselectDataRow(p, l);
				if (c) {
					d[d.length] = l
				}
			}
		}
	}
	var j = b.getAttribute("childgroupidsuffixes");
	if (j != null && j != "") {
		var a = j.split(";");
		for (var r = 0; r < a.length; r = r + 1) {
			var q = a[r];
			if (q == null || q == "") {
				continue
			}
			var l = t.getElementById(h + q);
			if (l == null) {
				continue
			}
			var n = getSelectCheckBoxObj(l);
			if (f) {
				n.checked = true
			} else {
				n.checked = false
			}
		}
	}
}
function selectParentDataRows(a, f, c) {
	if (f == null || f == "") {
		return
	}
	var m = document;
	var e = m.getElementById(a + f);
	if (e == null) {
		return
	}
	var o = getSelectCheckBoxObj(e);
	if (o == null) {
		return
	}
	if (c) {
		o.checked = true
	} else {
		var j = e.getAttribute("childgroupidsuffixes");
		if (j && j != "") {
			var h = j.split(";");
			for (var d = 0; d < h.length; d = d + 1) {
				var b = h[d];
				if (b == null || b == "") {
					continue
				}
				var g = m.getElementById(a + b);
				if (g == null) {
					continue
				}
				var k = getSelectCheckBoxObj(g);
				if (k.checked) {
					c = true;
					break
				}
			}
		} else {
			var n = e.getAttribute("childdataidsuffixes");
			if (n != null && n != "") {
				var l = n.split(";");
				for (var d = 0; d < l.length; d = d + 1) {
					var b = l[d];
					if (!b || b == "") {
						continue
					}
					var g = m.getElementById(a + b);
					if (g == null) {
						continue
					}
					var k = getSelectCheckBoxObj(g);
					if (k.checked) {
						c = true;
						break
					}
				}
			}
		}
		if (c) {
			o.checked = true
		} else {
			o.checked = false
		}
	}
	selectParentDataRows(a, e.getAttribute("parenttridsuffix"), c)
}
function getSelectCheckBoxObj(e) {
	var g = e.getElementsByTagName("INPUT");
	var f = null;
	for (var c = 0, a = g.length; c < a; c = c + 1) {
		var b = g[c].getAttribute("name");
		var d = g[c].getAttribute("type");
		if (!d || d != "checkbox") {
			continue
		}
		if (!b || b.indexOf("_rowselectbox_col") <= 0) {
			continue
		}
		f = g[c];
		break
	}
	return f
}
function getSelectRadioBoxObj(f) {
	var g = f.getElementsByTagName("INPUT");
	var e = null;
	for (var c = 0, a = g.length; c < a; c = c + 1) {
		var b = g[c].getAttribute("name");
		var d = g[c].getAttribute("type");
		if (!d || d != "radio") {
			continue
		}
		if (!b || b.indexOf("_rowselectbox_col") <= 0) {
			continue
		}
		e = g[c];
		break
	}
	return e
}
function doSelectedAllDataRowChkRadio(b) {
	var c = b.getAttribute("name");
	var a = c.lastIndexOf("_rowselectbox");
	if (a <= 0) {
		return
	}
	var d = c.substring(0, a);
	WX_selected_selectBoxObj_temp = b;
	if (isHasIgnoreSlaveReportsSavingData(d)) {
		wx_confirm(
				"\u672c\u64cd\u4f5c\u53ef\u80fd\u4f1a\u4e22\u5931\u5bf9\u4ece\u62a5\u8868\u6570\u636e\u7684\u4fee\u6539\uff0c\u662f\u5426\u7ee7\u7eed\uff1f",
				null, null, null, doSelectedAllDataRowChkRadioImpl,
				cancelSelectDeselectChkRadio)
	} else {
		doSelectedAllDataRowChkRadioImpl("ok")
	}
}
function doSelectedAllDataRowChkRadioImpl(m) {
	if (!wx_isOkConfirm(m)) {
		wx_callCancelEvent();
		return
	}
	var e = WX_selected_selectBoxObj_temp;
	WX_selected_selectBoxObj_temp = null;
	initRowSelect();
	var p = new Array();
	var b = new Array();
	var r = e.getAttribute("name");
	var n = r.lastIndexOf("_rowselectbox");
	if (n <= 0) {
		return
	}
	var c = r.substring(0, n);
	var o = getReportMetadataObj(c);
	if (o == null) {
		return
	}
	var l = document.getElementsByName(r + "_col");
	if (l == null || l.length == 0) {
		return
	}
	var f = e.checked;
	var h, k, a;
	var q = new Object();
	for (var g = 0, j = l.length; g < j; g = g + 1) {
		h = l[g];
		if (h == null) {
			continue
		}
		var d = h.getAttribute("rowgroup");
		if (d == "true") {
			h.checked = f;
			continue
		}
		k = getSelectedTrParent(h);
		if (k == null || k.getAttribute("disabled_rowselected") == "true") {
			continue
		}
		a = h.checked;
		if (f) {
			selectDataRow(o, k);
			h.checked = true;
			if (!a && q[k.getAttribute("id")] != "true") {
				p[p.length] = k;
				q[k.getAttribute("id")] = "true"
			}
		} else {
			deselectDataRow(o, k);
			h.checked = false;
			if (a && q[k.getAttribute("id")] != "true") {
				b[b.length] = k;
				q[k.getAttribute("id")] = "true"
			}
		}
	}
	invokeRowSelectedMethods(o, p, b)
}
function getSelectedTrObjGuid(a, c) {
	if (a == null) {
		return null
	}
	var b = c.getAttribute("global_rowindex");
	if (b == null || b == "") {
		return null
	}
	return a.reportguid + "_tr_" + b
}
function isSelectedRowImpl(a, c) {
	if (a == null || a == "") {
		return false
	}
	var d = WX_selectedTrObjs[a];
	var b = c.getAttribute("global_rowindex");
	if (b == null || b == "") {
		return false
	}
	return d != null && d[a + "_tr_" + b] != null
}
function selectDataRow(c, d) {
	var b = c.reportguid;
	var a = getSelectedTrObjGuid(c, d);
	if (a == null || a == "") {
		return
	}
	var e = WX_selectedTrObjs[b];
	if (e == null) {
		e = new Object();
		WX_selectedTrObjs[b] = e
	}
	e[a] = d;
	setTrBgcolorInSelect(d, b)
}
function deselectDataRow(b, c) {
	if (isTrObjInCurrentPage(b, c)) {
		resetTrBgcolorInSelect(c)
	}
	if (WX_selectedTrObjs == null) {
		return
	}
	var d = WX_selectedTrObjs[b.reportguid];
	var a = getSelectedTrObjGuid(b, c);
	if (a == null || a == "") {
		return
	}
	if (d != null && d[a] != null) {
		delete d[a]
	}
}
function deselectAllDataRow(b) {
	var d = getListReportSelectedTrObjsImpl(b.pageid, b.reportid, false, false);
	if (d != null && d.length > 0) {
		for (var c = 0, a = d.length; c < a; c++) {
			if (isTrObjInCurrentPage(b, d[c])) {
				resetTrBgcolorInSelect(d[c])
			}
		}
	}
	if (WX_selectedTrObjs != null) {
		delete WX_selectedTrObjs[b.reportguid]
	}
	return d
}
function getRealDeselectedTrObjs(c, f) {
	if (c == null || c.length == 0) {
		return f
	}
	if (f == null || f.length == 0) {
		return f
	}
	var b = new Object();
	for (var d = 0, a = c.length; d < a; d++) {
		b[c[d].getAttribute("global_rowindex")] = "true"
	}
	var e = new Array();
	for (var d = 0, a = f.length; d < a; d++) {
		if (b[f[d].getAttribute("global_rowindex")] == "true") {
			continue
		}
		e[e.length] = f[d]
	}
	return e
}
function getSelectedTrParent(a) {
	if (!a) {
		return null
	}
	while (a != null) {
		if (isListReportDataTrObj(a)) {
			return a
		}
		a = a.parentNode
	}
	return null
}
function isListReportDataTrObj(b) {
	if (b.tagName != "TR") {
		return false
	}
	var c = b.getAttribute("id");
	if (!c || c == "") {
		return false
	}
	var a = c.lastIndexOf("_tr_");
	if (a <= 0) {
		return false
	}
	if (c.indexOf("trgoup_") > 0) {
		return false
	}
	if (c.substring(0, a).indexOf(WX_GUID_SEPERATOR) > 0
			&& parseInt(c.substring(a + 4)) >= 0) {
		return true
	}
	return false
}
function getRowSelectType(b) {
	var a = getReportMetadataObj(b);
	if (a == null) {
		return ""
	}
	return a.metaDataSpanObj.getAttribute("rowselecttype")
}
function invokeRowSelectedMethods(b, g, f) {
	if ((g == null || g.length == 0) && (f == null || f.length == 0)) {
		return
	}
	var d = b.metaDataSpanObj.getAttribute("rowSelectMethods");
	var a = getObjectByJsonString(d);
	if (a == null) {
		return
	}
	var c = a.rowSelectMethods;
	if (c == null || c.length == 0) {
		return
	}
	for (var e = 0; e < c.length; e = e + 1) {
		c[e].value(b.pageid, b.reportid, g, f)
	}
}
function getListReportSelectedTrObjsImpl(b, e, g, j) {
	if (WX_selectedTrObjs == null) {
		return null
	}
	var a = getComponentGuidById(b, e);
	var c = WX_selectedTrObjs[a];
	if (c == null) {
		return null
	}
	var i = getReportMetadataObj(a);
	var f = new Array();
	var d;
	for ( var h in c) {
		d = c[h];
		if (d == null) {
			continue
		}
		if (g === true && !isTrObjInCurrentPage(i, d)) {
			continue
		}
		f[f.length] = d
	}
	if (f.length > 0 && j === true) {
		orderSelectedTrObjsArr(f)
	}
	return f
}
function isTrObjInCurrentPage(a, b) {
	if (b == null) {
		return false
	}
	if (a == null
			|| a.metaDataSpanObj.getAttribute("isSelectRowCrossPages") !== "true") {
		return true
	}
	return b.getAttribute("wx_not_in_currentpage") != "true"
}
function orderSelectedTrObjsArr(c) {
	if (c == null || c.length < 2) {
		return
	}
	var h, g, e;
	var a = c.length;
	for (var f = 0; f < a - 1; f++) {
		for (var d = f + 1; d < a; d++) {
			e = false;
			h = c[f].getAttribute("global_rowindex");
			g = c[d].getAttribute("global_rowindex");
			if (h.indexOf("new_") == 0 && g.indexOf("new_") == 0) {
				e = parseInt(h.substring("new_".length)) > parseInt(g
						.substring("new_".length))
			} else {
				if (h.indexOf("new_") < 0 && g.indexOf("new_") < 0) {
					e = parseInt(h) > parseInt(g)
				} else {
					e = h.indexOf("new_") == 0
				}
			}
			if (e) {
				var b = c[f];
				c[f] = c[d];
				c[d] = b
			}
		}
	}
}
function getListReportSelectedTrDatasImpl(a, g, k, l, b) {
	var h = getListReportSelectedTrObjsImpl(a, g, k, l);
	if (h == null || h.length == 0) {
		return null
	}
	var f = new Array();
	var e, j;
	for (var c = 0, d = h.length; c < d; c++) {
		e = h[c];
		if (e == null || (b !== true && e.getAttribute("EDIT_TYPE") == "add")) {
			continue
		}
		j = wx_getListReportColValuesInRow(e);
		if (j != null) {
			f[f.length] = j
		}
	}
	return f
}
function setTrBgcolorInSelect(b, a) {
	if (b == null) {
		return
	}
	storeTdsOriginalBgColorInTr(b);
	setTdsBgColorInTr(b, WX_selectedRowBgcolor)
}
function resetTrBgcolorInSelect(a) {
	if (a == null) {
		return
	}
	resetTdsBgColorInTr(a)
}
function changeRowBgcolorOnMouseOver(b, a) {
	if (b == null || !isListReportDataTrObj(b)) {
		return
	}
	storeTdsOriginalBgColorInTr(b);
	setTdsBgColorInTr(b, a)
}
function resetRowBgcolorOnMouseOver(a) {
	if (isSelectedRow(a)) {
		setTdsBgColorInTr(a, WX_selectedRowBgcolor)
	} else {
		resetTdsBgColorInTr(a)
	}
}
function storeTdsOriginalBgColorInTr(g) {
	if (g == null) {
		return
	}
	if (isSetTrBgColorOnly(g) === true) {
		var f = g.getAttribute("tr_original_bgcolor");
		if (f != null && f != "") {
			return
		}
		f = getElementBgColor(g);
		if (f == null || f == "") {
			f = "#ffffff"
		}
		g.setAttribute("tr_original_bgcolor", f)
	} else {
		var a, d, f, j;
		var h = g.cells;
		var b = false;
		for (var c = 0, e = h.length; c < e; c++) {
			j = h[c];
			a = j.getAttribute("groupcol");
			if (a == "true") {
				continue
			}
			d = j.getAttribute("isFixedCol");
			if (d == "true") {
				continue
			}
			if (!b) {
				f = j.getAttribute("td_original_bgcolor");
				if (f != null && f != "") {
					return
				}
				b = true
			}
			f = getElementBgColor(j);
			if (f == null || f == "") {
				f = "#ffffff"
			}
			j.setAttribute("td_original_bgcolor", f)
		}
	}
}
function setTdsBgColorInTr(f, h) {
	if (f == null) {
		return
	}
	if (isSetTrBgColorOnly(f) === true) {
		f.style.backgroundColor = h
	} else {
		var g = f.cells;
		var b, d, c;
		for (var e = 0, a = g.length; e < a; e++) {
			c = g[e];
			b = c.getAttribute("groupcol");
			if (b == "true") {
				continue
			}
			d = c.getAttribute("isFixedCol");
			if (d == "true") {
				continue
			}
			c.style.backgroundColor = h
		}
	}
}
function resetTdsBgColorInTr(f) {
	if (isSetTrBgColorOnly(f) === true) {
		var b = f.getAttribute("tr_original_bgcolor");
		if (b == null || b == "") {
			return
		}
		f.style.backgroundColor = b
	} else {
		var a, d, h = 0, b;
		var g = f.cells, j;
		for (var c = 0, e = g.length; c < e; c++) {
			j = g[c];
			a = j.getAttribute("groupcol");
			if (a == "true") {
				continue
			}
			d = j.getAttribute("isFixedCol");
			if (d == "true") {
				continue
			}
			b = j.getAttribute("td_original_bgcolor");
			if (b == null || b == "") {
				return
			}
			j.style.backgroundColor = b
		}
	}
}
function isSetTrBgColorOnly(e) {
	if (e == null) {
		return true
	}
	var b = e.getAttribute("wx_isSetTrBgColorOnly_flag");
	if (b != null && b != "") {
		return b == "true"
	}
	var f = e.cells, c;
	for (var d = 0, a = f.length; d < a; d++) {
		c = f[d];
		isgroupcol = c.getAttribute("groupcol");
		isFixedCol = c.getAttribute("isFixedCol");
		if (isgroupcol == "true" || isFixedCol == "true") {
			e.setAttribute("wx_isSetTrBgColorOnly_flag", "false");
			return false
		}
	}
	e.setAttribute("wx_isSetTrBgColorOnly_flag", "true");
	return true
}
var WX_Current_Slave_TrObj;
function clearCurrentSlaveTrObjOfReport(a) {
	if (WX_Current_Slave_TrObj == null) {
		return
	}
	delete WX_Current_Slave_TrObj[a]
}
function getRealCurrentSlaveTrObjForReport(c) {
	if (WX_Current_Slave_TrObj == null) {
		return null
	}
	var b = WX_Current_Slave_TrObj[c];
	if (b == null) {
		return null
	}
	if (b.getAttribute("wx_not_in_currentpage") !== "true") {
		return b
	}
	var g = document.getElementById(c + "_data");
	if (g == null) {
		return null
	}
	var f = g.getElementsByTagName("TR");
	var e;
	for (var d = 0, a = f.length; d < a; d++) {
		e = f[d];
		if (isTheSameSlaveTrObjOfReport(c, b, e)) {
			return e
		}
	}
	return null
}
function setCurrentSlaveTrObjForReport(b, a) {
	if (WX_Current_Slave_TrObj == null) {
		WX_Current_Slave_TrObj = new Object()
	}
	WX_Current_Slave_TrObj[b] = a
}
function isCurrentSlaveTrObjOfReport(b, c) {
	if (c == null || WX_Current_Slave_TrObj == null) {
		return false
	}
	var a = WX_Current_Slave_TrObj[b];
	if (a == null || a.getAttribute("wx_not_in_currentpage") === "true") {
		return false
	}
	return isTheSameSlaveTrObjOfReport(b, c, a)
}
function isTheSameSlaveTrObjOfReport(c, f, d) {
	if (f == null || d == null) {
		return false
	}
	var h = getRefreshSlaveReportsHrefParamsMap(f);
	var g = getRefreshSlaveReportsHrefParamsMap(d);
	if (h == null || g == null) {
		return false
	}
	var b, a;
	for ( var e in h) {
		b = h[e];
		a = g[e];
		if (b == null) {
			b = ""
		}
		if (a == null) {
			a = ""
		}
		if (b != a) {
			return false
		}
		delete g[e]
	}
	for ( var e in g) {
		if (g[e] != null && g[e] != "") {
			return false
		}
	}
	return true
}
function getRefreshSlaveReportsHrefParams(c) {
	if (c == null) {
		return ""
	}
	var d = getRefreshSlaveReportsHrefParamsMap(c);
	if (d == null) {
		return ""
	}
	var b = "";
	for ( var a in d) {
		if (b != "") {
			b = b + "&"
		}
		b = b + a + "=" + encodeURIComponent(d[a])
	}
	return b
}
function getRefreshSlaveReportsHrefParamsMap(h) {
	var c = h.getElementsByTagName("TD");
	var e = new Object();
	var b, d;
	var g = false;
	for (var f = 0, a = c.length; f < a; f = f + 1) {
		b = c[f].getAttribute("slave_paramname");
		if (b == null || b == "") {
			continue
		}
		d = c[f].getAttribute("value");
		if (d == null) {
			d = ""
		}
		e[b] = d;
		g = true
	}
	if (g === false) {
		return null
	}
	return e
}
function initdrag(b, a) {
	b.isInit = true;
	b.getTdWidthByIndex = function(d) {
		var g = b.parentNode.parentNode.cells[b.parentNode.cellIndex + d];
		var e = g.style.width;
		if (e && e != "" && e.indexOf("%") < 0) {
			return parseInt(e)
		}
		if (window.ActiveXObject || isChrome || ISOPERA) {
			return g.offsetWidth
		} else {
			var f = b.parentNode.parentNode.parentNode.parentNode.cellPadding;
			if (!f) {
				f = 1
			}
			var c = b.parentNode.parentNode.parentNode.parentNode.border;
			if (!c) {
				c = 1
			} else {
				if (parseInt(c) >= 1) {
				}
			}
			return parseInt(b.parentNode.parentNode.cells[b.parentNode.cellIndex
					+ d].offsetWidth)
					- parseInt(f) * 2 - parseInt(c)
		}
	};
	b.setTdWidthByIndex = function(d, c) {
		b.parentNode.parentNode.cells[d].style.width = c + "px"
	};
	b.firstChild.onmousedown = function() {
		return false
	};
	b.onmousedown = function(c) {
		var g = document;
		if (!c) {
			c = window.event
		}
		var f = c.clientX;
		var e = 0;
		if (a) {
			e = b.getTdWidthByIndex(0) + b.getTdWidthByIndex(1)
		}
		if (b.setCapture) {
			b.setCapture()
		} else {
			if (window.captureEvents) {
				window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP)
			}
		}
		g.onmousemove = function(d) {
			if (!d) {
				d = window.event
			}
			if (a && b.getTdWidthByIndex(0) + b.getTdWidthByIndex(1) > e) {
				b.setTdWidthByIndex(b.parentNode.cellIndex + 1, e
						- b.getTdWidthByIndex(0));
				return
			}
			var h = d.clientX - f;
			if (h > 0) {
				if (a
						&& parseInt(b.parentNode.parentNode.cells[b.parentNode.cellIndex + 1].style.width)
								- h < 10) {
					return
				}
				b.setTdWidthByIndex(b.parentNode.cellIndex, b
						.getTdWidthByIndex(0)
						+ h);
				if (a) {
					b.setTdWidthByIndex(b.parentNode.cellIndex + 1, b
							.getTdWidthByIndex(1)
							- h)
				} else {
					b.parentNode.parentNode.parentNode.parentNode.style.width = (b.parentNode.parentNode.parentNode.parentNode.offsetWidth + h)
							+ "px"
				}
			} else {
				if (parseInt(b.parentNode.parentNode.cells[b.parentNode.cellIndex].style.width)
						+ h < 10) {
					return
				}
				b.setTdWidthByIndex(b.parentNode.cellIndex, b
						.getTdWidthByIndex(0)
						+ h);
				if (a) {
					b.setTdWidthByIndex(b.parentNode.cellIndex + 1, b
							.getTdWidthByIndex(1)
							- h)
				} else {
					b.parentNode.parentNode.parentNode.parentNode.style.width = (b.parentNode.parentNode.parentNode.parentNode.offsetWidth + h)
							+ "px"
				}
			}
			f = d.clientX
		};
		g.onmouseup = function() {
			if (b.releaseCapture) {
				b.releaseCapture()
			} else {
				if (window.captureEvents) {
					window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP)
				}
			}
			g.onmousemove = null;
			g.onmouseup = null
		}
	}
}
var dragrow_table;
var dragrow_pageid;
var dragrow_reportid;
var _tempDragrowTarget;
var _fromDragrowTarget;
var _toDroprowTarget;
var _isDragRow = false;
var dragrow_enabled = true;
function handleRowDragMouseDown(trObj, pageid, reportid) {
	if (trObj.getAttribute("EDIT_TYPE") == "add") {
		return
	}
	if (_tempDragrowTarget != null) {
		handleRowMouseUp(trObj);
		return
	}
	if (!dragrow_enabled) {
		return
	}
	_isDragRow = true;
	_fromDragrowTarget = trObj;
	_toDroprowTarget = trObj;
	dragrow_pageid = pageid;
	dragrow_reportid = reportid;
	dragrow_table = getParentElementObj(trObj, "TABLE");
	if (dragrow_table == null) {
		return false
	}
	document.body.onselectstart = function() {
		return false
	};
	document.body.style.MozUserSelect = "none";
	if (!dragrow_table.isInitRowDrag) {
		dragrow_table.isInitRowDrag = true;
		var trObjTmp;
		var trObjs = dragrow_table.tBodies[0].rows;
		for (var i = 0, len = trObjs.length; i < len; i++) {
			trObjTmp = trObjs[i];
			trObjTmp.onmouseup = function() {
				handleRowMouseUp(this)
			}
		}
	}
	document.body.style.cursor = "move";
	EventTools.addEventHandler(window.document.body, "mousemove",
			handleRowMouseMove);
	EventTools.addEventHandler(window.document.body, "mouseup",
			handleBodyRowMouseUp);
	_tempDragrowTarget = document.createElement("TABLE");
	_tempDragrowTarget.className = dragrow_table.className;
	var tbodyObj = document.createElement("TBODY");
	tbodyObj.appendChild(trObj.cloneNode(true));
	_tempDragrowTarget.appendChild(tbodyObj);
	with (_tempDragrowTarget.style) {
		display = "none";
		position = "absolute";
		zIndex = 101;
		filter = "Alpha(style=0,opacity=50)";
		opacity = 0.5;
		width = dragrow_table.clientWidth + "px";
		left = getElementAbsolutePosition(dragrow_table).left
	}
	if (dragrow_table.style.tableLayout != null) {
		_tempDragrowTarget.style.tableLayout = dragrow_table.style.tableLayout
	}
	document.body.appendChild(_tempDragrowTarget)
}
function handleBodyRowMouseUp() {
	document.body.style.cursor = "";
	document.body.onselectstart = function() {
		return true
	};
	document.body.style.MozUserSelect = "";
	_isDragRow = false;
	removeTempDragrowTarget();
	EventTools.removeEventHandler(window.document.body, "mousemove",
			handleRowMouseMove);
	EventTools.removeEventHandler(window.document.body, "mouseup",
			handleBodyRowMouseUp);
	_toDroprowTarget = null
}
function handleRowMouseUp(d) {
	document.body.style.cursor = "";
	removeTempDragrowTarget();
	if (!_isDragRow) {
		return false
	}
	_isDragRow = false;
	EventTools.removeEventHandler(window.document.body, "mousemove",
			handleRowMouseMove);
	EventTools.removeEventHandler(window.document.body, "mouseup",
			handleBodyRowMouseUp);
	if (_toDroprowTarget != null) {
		var a = getParentElementObj(d, "TABLE");
		if (a == dragrow_table) {
			if (d.getAttribute("EDIT_TYPE") == "add") {
				var c = dragrow_table.tBodies[0].rows;
				for (var b = c.length - 1; b >= 0; b--) {
					if (c[b].getAttribute("EDIT_TYPE") == "add") {
						continue
					}
					if (!isListReportDataTrObj(c[b])) {
						continue
					}
					d = c[b];
					break
				}
			}
			_toDroprowTarget = d;
			changeListReportRoworderByDrag()
		}
		_toDroprowTarget = null
	}
	document.body.onselectstart = function() {
		return true
	};
	document.body.style.MozUserSelect = ""
}
function removeTempDragrowTarget() {
	if (_tempDragrowTarget != null) {
		if (_tempDragrowTarget.parentNode != null) {
			_tempDragrowTarget.parentNode.removeChild(_tempDragrowTarget)
		} else {
			_tempDragrowTarget.style.display = "none"
		}
		_tempDragrowTarget = null
	}
}
function handleRowMouseMove(oEvent) {
	oEvent = EventTools.getEvent(oEvent);
	if (oEvent.type.indexOf("mousemove") == -1) {
		EventTools.removeEventHandler(window.document.body, "mousemove",
				handleRowMouseMove);
		EventTools.removeEventHandler(window.document.body, "mouseup",
				handleBodyRowMouseUp);
		return false
	}
	with (_tempDragrowTarget.style) {
		top = (oEvent.pageY + 5) + "px";
		display = ""
	}
}
function changeListReportRoworderByDrag() {
	if (_fromDragrowTarget == null || _toDroprowTarget == null
			|| _fromDragrowTarget == _toDroprowTarget) {
		return false
	}
	if (!isListReportDataTrObj(_toDroprowTarget)) {
		return false
	}
	var d = _fromDragrowTarget.getAttribute("id");
	var f = _toDroprowTarget.getAttribute("id");
	if (d == f) {
		return false
	}
	var e = parseInt(d.substring(d.lastIndexOf("_tr_") + "_tr_".length), 10);
	var c = parseInt(f.substring(f.lastIndexOf("_tr_") + "_tr_".length), 10);
	var g = e > c;
	var a = getRoworderUrl(dragrow_pageid, dragrow_reportid, _fromDragrowTarget);
	if (a == null || a == "") {
		return false
	}
	var b = getRoworderParamsInTr(_toDroprowTarget);
	a = a + "&" + dragrow_reportid + "_ROWORDERTYPE=drag";
	a = a + "&" + dragrow_reportid + "_DESTROWPARAMS=" + b;
	a = a + "&" + dragrow_reportid + "_ROWORDERDIRECT=" + g;
	refreshComponent(a)
}
function changeListReportRoworderByArrow(b, f, e, c) {
	var h = getValidParentTrObj(e);
	if (h == null) {
		return false
	}
	var a = getRoworderUrl(b, f, h);
	var g = h.getAttribute("id");
	var j = parseInt(g.substring(g.lastIndexOf("_tr_") + "_tr_".length), 10);
	var d = null;
	if (c && j > 0) {
		d = document.getElementById(g.substring(0, g.lastIndexOf("_tr_")
				+ "_tr_".length)
				+ (j - 1))
	} else {
		if (!c) {
			d = document.getElementById(g.substring(0, g.lastIndexOf("_tr_")
					+ "_tr_".length)
					+ (j + 1))
		}
	}
	if (d != null && d.getAttribute("EDIT_TYPE") != "add") {
		var i = getRoworderParamsInTr(d);
		a = a + "&" + f + "_DESTROWPARAMS=" + i
	}
	a = a + "&" + f + "_ROWORDERTYPE=arrow";
	a = a + "&" + f + "_ROWORDERDIRECT=" + c;
	refreshComponent(a)
}
var WX_Roworder_inputbox_pageid;
var WX_Roworder_inputbox_reportid;
var WX_Roworder_inputbox_trObj;
var WX_Roworder_inputbox_newordervalue;
function changeListReportRoworderByInputbox(a, b, c, e) {
	if (c == null || c.value == null || c.value == "" || c.value == e) {
		return
	}
	var d = getValidParentTrObj(c);
	if (d == null) {
		return
	}
	WX_Roworder_inputbox_pageid = a;
	WX_Roworder_inputbox_reportid = b;
	WX_Roworder_inputbox_trObj = d;
	WX_Roworder_inputbox_newordervalue = c.value;
	wx_confirm("\u786e\u8ba4\u4fee\u6539\u6b64\u884c\u6392\u5e8f\u503c\u4e3a"
			+ c.value + "?", "\u6392\u5e8f", null, null,
			doChangeListReportRoworderByInputbox)
}
function doChangeListReportRoworderByInputbox(a) {
	if (wx_isOkConfirm(a)) {
		var b = getRoworderUrl(WX_Roworder_inputbox_pageid,
				WX_Roworder_inputbox_reportid, WX_Roworder_inputbox_trObj);
		if (b == null || b == "") {
			wx_warn("\u6ca1\u6709\u53d6\u5230\u884c\u6392\u5e8f\u6240\u9700\u7684\u53c2\u6570");
			return
		}
		b = b + "&" + WX_Roworder_inputbox_reportid + "_ROWORDERTYPE=inputbox";
		b = b + "&" + WX_Roworder_inputbox_reportid + "_ROWORDERVALUE="
				+ WX_Roworder_inputbox_newordervalue;
		refreshComponent(b)
	}
	WX_Roworder_inputbox_pageid = null;
	WX_Roworder_inputbox_reportid = null;
	WX_Roworder_inputbox_trObj = null;
	WX_Roworder_inputbox_newordervalue = null
}
function changeListReportRoworderByTop(a, b, d) {
	var e = getValidParentTrObj(d);
	var c = getRoworderUrl(a, b, e);
	if (c == null || c == "") {
		return
	}
	c = c + "&" + b + "_ROWORDERTYPE=top";
	refreshComponent(c)
}
function getValidParentTrObj(a) {
	while (a != null) {
		if (a.tagName == "TR" && isListReportDataTrObj(a)
				&& a.getAttribute("EDIT_TYPE") != "add") {
			return a
		}
		a = getParentElementObj(a, "TR")
	}
	return null
}
function getRoworderUrl(a, d, f) {
	var c = getComponentGuidById(a, d);
	var g = getReportMetadataObj(c);
	var e = getComponentUrl(a, g.refreshComponentGuid, g.slave_reportid);
	var b = getRoworderParamsInTr(f);
	if (b == null || b == "") {
		return null
	}
	e = e + "&" + d + "_ROWORDERPARAMS=" + encodeURIComponent(b);
	return e
}
function getRoworderParamsInTr(f) {
	var b = "";
	var c;
	var d, g;
	for (var e = 0, a = f.cells.length; e < a; e++) {
		c = f.cells[e];
		d = c.getAttribute("value_name");
		if (d == null || d == "") {
			continue
		}
		g = c.getAttribute("value");
		if (g == null) {
			g = ""
		}
		b = b + d + SAVING_NAMEVALUE_SEPERATOR + g + SAVING_COLDATA_SEPERATOR
	}
	if (b.lastIndexOf(SAVING_COLDATA_SEPERATOR) == b.length
			- SAVING_COLDATA_SEPERATOR.length) {
		b = b.substring(0, b.length - SAVING_COLDATA_SEPERATOR.length)
	}
	return b
}
var drag_table;
var drag_pageid;
var drag_reportid;
var _tempDragTarget;
var _fromDragTarget;
var _toDropTarget;
var _isDrag = false;
var drag_enabled = true;
function insertAfter(c, a) {
	var b = a.parentNode;
	if (b.lastChild == a) {
		b.appendChild(c)
	} else {
		b.insertBefore(c, a.nextSibling)
	}
}
function setTempDragTarget(a) {
	_tempDragTarget.innerHTML = a.innerHTML;
	_tempDragTarget.className = "dragShadowOnMove";
	_tempDragTarget.style.display = "none";
	_tempDragTarget.style.height = a.clientHeight + "px";
	_tempDragTarget.style.width = a.clientWidth + "px"
}
function handleCellDragMouseDown(b, a, f) {
	if (!drag_enabled) {
		return false
	}
	_isDrag = true;
	_tempDragTarget = document.getElementById("dragShadowObjId");
	if (!_tempDragTarget) {
		_tempDragTarget = document.createElement("DIV");
		_tempDragTarget.style.display = "none";
		_tempDragTarget.id = "dragShadowObjId";
		document.body.appendChild(_tempDragTarget)
	}
	setTempDragTarget(b);
	_fromDragTarget = b;
	_toDropTarget = b;
	drag_pageid = a;
	drag_reportid = f;
	drag_table = getParentElementObj(b, "TABLE");
	if (!drag_table) {
		return false
	}
	document.body.onselectstart = function() {
		return false
	};
	document.body.style.MozUserSelect = "none";
	if (!drag_table.isInitCellDrag) {
		drag_table.isInitCellDrag = true;
		for (var e = 0, g = drag_table.tBodies[0].rows.length; e < g; e++) {
			var k = drag_table.tBodies[0].rows[e].cells;
			for (var d = 0, c = k.length; d < c; d++) {
				var h = k[d];
				h.onmouseover = function() {
					handleMouseOver(this)
				};
				h.onmouseout = function() {
					handleMouseOut()
				};
				h.onmouseup = function() {
					handleMouseUp(this)
				}
			}
		}
	}
	document.body.style.cursor = "move";
	EventTools.addEventHandler(window.document.body, "mousemove",
			handleMouseMove);
	EventTools.addEventHandler(window.document.body, "mouseup",
			handleBodyMouseUp)
}
function handleBodyMouseUp() {
	document.body.style.cursor = "";
	document.body.onselectstart = function() {
		return true
	};
	document.body.style.MozUserSelect = "";
	_isDrag = false;
	EventTools.removeEventHandler(window.document.body, "mousemove",
			handleMouseMove);
	EventTools.removeEventHandler(window.document.body, "mouseup",
			handleBodyMouseUp);
	_tempDragTarget.style.display = "none";
	if (_toDropTarget) {
		_toDropTarget = null
	}
}
function handleMouseUp(b) {
	document.body.style.cursor = "";
	if (!_isDrag) {
		return false
	}
	_isDrag = false;
	EventTools.removeEventHandler(window.document.body, "mousemove",
			handleMouseMove);
	EventTools.removeEventHandler(window.document.body, "mouseup",
			handleBodyMouseUp);
	_tempDragTarget.style.display = "none";
	if (_toDropTarget) {
		var a = getParentElementObj(b, "TABLE");
		if (a == drag_table) {
			_toDropTarget = b;
			moveTargetToByServer()
		}
		_toDropTarget = null
	}
	document.body.onselectstart = function() {
		return true
	};
	document.body.style.MozUserSelect = ""
}
function handleMouseOver(b) {
	if (!_isDrag) {
		return false
	}
	var a = getParentElementObj(b, "TABLE");
	if (a == drag_table) {
		document.body.style.cursor = "move";
		_toDropTarget = b
	}
}
function handleMouseOut() {
	if (!_toDropTarget) {
		return false
	}
	if (_isDrag) {
		document.body.style.cursor = "not-allowed"
	}
	_toDropTarget = null
}
function handleMouseMove(oEvent) {
	oEvent = EventTools.getEvent(oEvent);
	if (oEvent.type.indexOf("mousemove") == -1) {
		EventTools.removeEventHandler(window.document.body, "mousemove",
				handleMouseMove);
		EventTools.removeEventHandler(window.document.body, "mouseup",
				handleBodyMouseUp);
		return false
	}
	var x = oEvent.pageX + 10;
	var y = oEvent.pageY + 10;
	with (_tempDragTarget.style) {
		left = x + "px";
		top = y + "px";
		display = ""
	}
}
function moveTargetToByClient() {
	if (!_fromDragTarget || !_toDropTarget || _fromDragTarget == _toDropTarget) {
		return false
	}
	var c = _fromDragTarget.cellIndex;
	var d = _toDropTarget.cellIndex;
	if (c == d) {
		return
	}
	var g = true;
	if (c > d) {
		g = false
	}
	for (var b = 0; b < drag_table.tBodies[0].rows.length; b++) {
		var f = drag_table.tBodies[0].rows[b];
		var e = f.cells[c];
		var a = f.cells[d];
		if (!g) {
			f.insertBefore(e, a)
		} else {
			if (a.cellIndex == f.cells.length - 1) {
				f.appendChild(e)
			} else {
				f.insertBefore(e, f.cells[d + 1])
			}
		}
	}
}
function moveTargetToByServer() {
	if (!_fromDragTarget || !_toDropTarget || _fromDragTarget == _toDropTarget) {
		return false
	}
	var f = getThOfDropTargetTd();
	if (f == 0) {
		return
	}
	var a = _fromDragTarget.getAttribute("dragcolid");
	var d = _toDropTarget.getAttribute("dragcolid");
	if (!a || !d || a == d) {
		return
	}
	var b = getComponentGuidById(drag_pageid, drag_reportid);
	var e = getReportMetadataObj(b);
	var c = getComponentUrl(drag_pageid, e.refreshComponentGuid,
			e.slave_reportid);
	c = replaceUrlParamValue(c, drag_reportid + "_DRAGCOLS", a + ";" + d);
	c = c + "&" + drag_reportid + "_DRAGDIRECT=" + f;
	WX_showProcessingBar = false;
	refreshComponent(c, null, {
		keepSelectedRowsAction : true,
		keepSavingRowsAction : false
	})
}
function getThOfDropTargetTd() {
	var g;
	var d;
	var m = _fromDragTarget.parentNode;
	for (var c = 0, e = m.cells.length; c < e; c++) {
		g = m.cells[c];
		d = g.getAttribute("dragcolid");
		if (d == null || d == "") {
			continue
		}
		var l = getElementAbsolutePosition(_fromDragTarget).left;
		var h = _toDropTarget.offsetWidth;
		var f = getElementAbsolutePosition(_toDropTarget).left;
		var k = g.offsetWidth;
		var a = getElementAbsolutePosition(g).left;
		if (_fromDragTarget == g || l == a) {
			continue
		}
		if (k < h) {
			continue
		}
		if (a > f) {
			continue
		}
		if (a <= f && a + k >= f + h) {
			var j = _fromDragTarget.getAttribute("parentGroupid");
			var b = g.getAttribute("parentGroupid");
			if (!j && !b || j == b) {
				_toDropTarget = g;
				if (l == a) {
					return 0
				}
				if (l > a) {
					return -1
				}
				if (l < a) {
					return 1
				}
			}
		}
	}
	return 0
}
function clickorderby(c, d) {
	var i = getParentElementObj(c, "TABLE");
	if (!i) {
		return false
	}
	var b = i.getAttribute("pageid");
	var f = i.getAttribute("reportid");
	var g = i.getAttribute("refreshComponentGuid");
	var e = i.getAttribute("isSlave");
	var h = null;
	if (e && e == "true") {
		h = f
	}
	var a = getComponentUrl(b, g, h);
	a = replaceUrlParamValue(a, f + "ORDERBY", d);
	a = replaceUrlParamValue(a, f + "ORDERBY_ACTION", "true");
	refreshComponent(a)
}
var COL_FILTER_btnObj;
var COL_FILTER_selectSpanTitleStart = "<span style='width:100%;display:block;' class='spanOutputTitleElement'>";
var COL_FILTER_selectSpanStart = "<span style='width:100%;display:block;'  class='spanOutputNormalElement' onmouseover='setHighColor(this)' ";
var COL_FILTER_selectSpanEnd = "</span>";
function closeAllColFilterResultSpan() {
	if (COL_FILTER_btnObj) {
		var b = document.getElementById(COL_FILTER_btnObj.obj.spanOutputId);
		if (b) {
			b.style.display = "none"
		}
		COL_FILTER_btnObj.obj.currentValueSelected = -1
	}
	COL_FILTER_btnObj = null;
	var a = document.getElementById("wx_titletree_container");
	if (a != null) {
		closeSelectedTree()
	}
}
function getFilterDataList(m, f) {
	closeAllColFilterResultSpan();
	COL_FILTER_btnObj = m;
	var g = getObjectByJsonString(f);
	var b = g.filterwidth;
	var d = getParentElementObj(m, "TD");
	if (m.obj == null
			|| ((b == null || b <= 0) && m.obj.spanOutputWidth != d.offsetWidth)) {
		m.obj = initializeFilter(m, g, -1)
	}
	m.obj.paramsObj = g;
	var l = getReportMetadataObj(g.reportguid);
	m.obj.metadataObj = l;
	var c = l.pageid;
	var h = l.reportid;
	var i = l.refreshComponentGuid;
	var j = l.slave_reportid;
	var a = getComponentUrl(c, i, j);
	a = replaceUrlParamValue(a, "REPORTID", h);
	a = replaceUrlParamValue(a, "ACTIONTYPE", "GetFilterDataList");
	a = replaceUrlParamValue(a, "FILTER_COLPROP", g.property);
	if (a != null && a != "") {
		var n = a.split("?");
		if (n == null || n.length <= 1) {
			n[1] = ""
		} else {
			if (n.length >= 2) {
				if (n.length > 2) {
					for (var e = 2; e < n.length; e = e + 1) {
						n[1] = n[1] + "?" + n[e]
					}
				}
			}
		}
		XMLHttpREPORT.sendReq("POST", n[0], n[1], buildFilterItems,
				onGetDataErrorMethod, "")
	}
}
function initializeFilter(g, f, b) {
	var d = {
		elem : g,
		paramsObj : null,
		metadataObj : null,
		spanOutputWidth : null,
		resultItemsXmlRoot : null,
		recordCount : 0,
		treeNodesArr : null,
		spanOutputId : "",
		currentValueSelected : -1,
		prevValueSelected : -1
	};
	if (g.id) {
		d.spanOutputId = "spanOutput_" + g.id
	} else {
		alert("\u5fc5\u987b\u7ed9\u7528\u4e8e\u70b9\u51fb\u7684\u6309\u94ae\u5bf9\u8c61\u5206\u914d\u4e00id\u5c5e\u6027")
	}
	var c = getParentElementObj(g, "TD");
	var e = f.filterwidth;
	if (e != null && e <= 0) {
		d.spanOutputWidth = c.offsetWidth
	} else {
		d.spanOutputWidth = e
	}
	if (f.multiply && f.multiply == "false") {
		var a = document.getElementById(d.spanOutputId);
		if (a == null) {
			var h = document.createElement("span");
			h.id = d.spanOutputId;
			h.className = "spanOutputTextDropdown";
			document.body.appendChild(h);
			a = h
		}
	}
	d.paramsObj = f;
	return d
}
function setHighColor(b) {
	if (b) {
		var c = b.id.split("_");
		COL_FILTER_btnObj.obj.prevValueSelected = COL_FILTER_btnObj.obj.currentValueSelected;
		COL_FILTER_btnObj.obj.currentValueSelected = c[c.length - 1]
	}
	if (parseInt(COL_FILTER_btnObj.obj.prevValueSelected) >= 0) {
		document.getElementById(COL_FILTER_btnObj.obj.spanOutputId + "_"
				+ COL_FILTER_btnObj.obj.prevValueSelected).className = "spanOutputNormalElement"
	}
	var a = document.getElementById(COL_FILTER_btnObj.obj.spanOutputId + "_"
			+ COL_FILTER_btnObj.obj.currentValueSelected);
	if (a) {
		a.className = "spanOutputHighElement"
	}
}
function onGetDataErrorMethod(a) {
	if (WXConfig.load_error_message != null
			&& WXConfig.load_error_message != "") {
		wx_error(WXConfig.load_error_message)
	}
	COL_FILTER_btnObj.obj.currentValueSelected = -1
}
function buildFilterItems(b) {
	var a = b.responseXML;
	COL_FILTER_btnObj.obj.resultItemsXmlRoot = a.getElementsByTagName("items")[0];
	if (COL_FILTER_btnObj.obj.resultItemsXmlRoot) {
		COL_FILTER_btnObj.obj.recordCount = COL_FILTER_btnObj.obj.resultItemsXmlRoot.childNodes.length
	} else {
		COL_FILTER_btnObj.obj.recordCount = 0
	}
	buildSelectListBox()
}
function buildSelectListBox() {
	var d = getElementAbsolutePosition(getParentElementObj(COL_FILTER_btnObj,
			"TD"));
	var x = document;
	if (COL_FILTER_btnObj.obj.paramsObj.multiply == "false") {
		var n = makeFilterSelectList();
		if (n.length > 0) {
			var m = x.getElementById(COL_FILTER_btnObj.obj.spanOutputId);
			m.innerHTML = n;
			x.getElementById(COL_FILTER_btnObj.obj.spanOutputId + "_0").className = "spanOutputHighElement";
			COL_FILTER_btnObj.obj.currentValueSelected = 0;
			m.style.display = "block";
			setOutputPosition(d, m, m, x
					.getElementById(COL_FILTER_btnObj.obj.spanOutputId
							+ "_inner"));
			EventTools.addEventHandler(window.document, "mousedown",
					handleDocumentMouseDownForSingleColFilter)
		} else {
			hideSingleColFilterSelectBox()
		}
	} else {
		var r = COL_FILTER_btnObj.obj.recordCount;
		if (r <= 0) {
			return
		}
		var y = COL_FILTER_btnObj.obj.paramsObj;
		var o = getReportMetadataObj(y.reportguid);
		var j = o.metaDataSpanObj.getAttribute("lazydisplaydata") == "true";
		var f = y.webroot;
		var q = y.skin;
		var l = f + "webresources/skin/" + q + "/images/coltitle_selected/";
		var a = '{img_rooturl:"' + l + '"';
		a = a + ',checkbox:"true"';
		a = a + ',treenodeimg:"false"';
		a = a + ",nodes:[";
		var k = new Array();
		var w;
		var c = COL_FILTER_btnObj.obj.resultItemsXmlRoot.childNodes;
		var p = "";
		var h = "";
		for (var s = 0; s < r; s = s + 1) {
			var b = c.item(s);
			if (b.childNodes.length <= 0) {
				continue
			}
			p = b.firstChild.childNodes[0].nodeValue;
			var e = b.firstChild.getAttribute("isChecked");
			if (j || e == null || e == "") {
				e = "false"
			}
			if (b.childNodes.length == 1) {
				h = p
			} else {
				h = b.lastChild.childNodes[0].nodeValue
			}
			if (p && (p == "[nodata]" || p == "[error]")) {
				a = h;
				break
			}
			var g = "col_filter_" + s;
			w = new Object();
			w.nodeid = g;
			w.nodevalue = p;
			k[k.length] = w;
			a = a + '{nodeid:"' + g + '"';
			a = a + ',title:"' + h + '"';
			a = a + ',checked:"' + e + '"';
			a = a + "},"
		}
		if (a.lastIndexOf(",") == a.length - 1) {
			a = a.substring(0, a.length - 1)
		}
		COL_FILTER_btnObj.obj.treeNodesArr = k;
		var u = '<ul class="bbit-tree-root bbit-tree-lines">';
		if (a.indexOf("nodes:[") < 0 && a.indexOf("{img_rooturl:") < 0) {
			u = u + a
		} else {
			a = a + "]}";
			u = u + showTreeNodes(a)
		}
		u = u + "</ul>";
		var v = x.getElementById("wx_titletree_content");
		v.innerHTML = u;
		var t = x.getElementById("wx_titletree_container");
		t.style.display = "";
		x.getElementById("wx_titletree_buttoncontainer").innerHTML = '<img src="'
				+ l + 'submit.gif" onclick="okSelectedColFilter()">';
		setOutputPosition(d, t, x.getElementById("titletree_container_inner"),
				v);
		EventTools.addEventHandler(window.document, "mousedown",
				handleDocumentMouseDownForSelectedTree)
	}
}
function setOutputPosition(e, d, b, a) {
	d.style.width = COL_FILTER_btnObj.obj.spanOutputWidth + "px";
	d.style.top = (e.top + e.height) + "px";
	d.style.left = (e.left + e.width - d.offsetWidth) + "px";
	var c = COL_FILTER_btnObj.obj.paramsObj.filtermaxheight;
	if (c == null || c < 15) {
		c = 350
	}
	if (a.offsetHeight < c - 10) {
		b.style.height = (a.offsetHeight + 10) + "px"
	} else {
		b.style.height = c + "px"
	}
}
function okSelectedColFilter() {
	var f = COL_FILTER_btnObj.obj.treeNodesArr;
	var e = "";
	if (f && f.length > 0) {
		var b;
		var g;
		var c = 0;
		for (var d = 0; d < f.length; d++) {
			b = f[d];
			g = document.getElementById(b.nodeid);
			var a = g.getAttribute("checked");
			if (a && a == "true") {
				e = e + b.nodevalue + ";;";
				c++
			}
		}
		if (c == f.length) {
			e = ""
		} else {
			if (e.lastIndexOf(";;") == e.length - 2) {
				e = e.substring(0, e.length - 2)
			}
			if (e == "") {
				wx_warn("\u8bf7\u9009\u62e9\u8981\u8fc7\u6ee4\u7684\u6570\u636e");
				return false
			}
		}
		filterReportData(e)
	}
	closeSelectedTree()
}
function makeFilterSelectList() {
	var g = new Array();
	if (!COL_FILTER_btnObj.obj.resultItemsXmlRoot) {
		return ""
	}
	var d = "";
	var h = "";
	var f = "";
	var a = COL_FILTER_btnObj.obj.recordCount;
	if (a <= 0) {
		return ""
	}
	var j = COL_FILTER_btnObj.obj.resultItemsXmlRoot.childNodes;
	for (var b = 0; b < a; b = b + 1) {
		var c = j.item(b);
		if (c.childNodes.length <= 0) {
			COL_FILTER_btnObj.obj.recordCount--;
			continue
		}
		h = c.firstChild.childNodes[0].nodeValue;
		if (c.childNodes.length == 1) {
			f = h
		} else {
			f = c.lastChild.childNodes[0].nodeValue
		}
		var e = " id='" + COL_FILTER_btnObj.obj.spanOutputId + "_" + b + "'";
		if (h && h != "" && h != "[nodata]" && h != "[error]") {
			e = e + " onmousedown=\"filterReportData('" + h + "')\""
		}
		e = e + ">" + f;
		d += COL_FILTER_selectSpanStart + e + COL_FILTER_selectSpanEnd
	}
	if (COL_FILTER_btnObj.obj.recordCount <= 0) {
		return ""
	}
	d = "<div id='" + COL_FILTER_btnObj.obj.spanOutputId + "_inner'>" + d
			+ "</div>";
	return d
}
function filterReportData(d) {
	var a = COL_FILTER_btnObj.obj.metadataObj;
	var b = getComponentUrl(a.pageid, a.refreshComponentGuid, a.slave_reportid);
	var c = COL_FILTER_btnObj.obj.paramsObj.urlParamName;
	b = replaceUrlParamValue(b, c, d);
	if (COL_FILTER_btnObj.obj.paramsObj.multiply != "false") {
		b = removeReportNavigateInfosFromUrl(b, a, 1);
		b = replaceUrlParamValue(b, a.reportid + "_COL_FILTERID", c)
	} else {
		b = removeReportNavigateInfosFromUrl(b, a, null);
		hideSingleColFilterSelectBox()
	}
	b = removeLazyLoadParamsFromUrl(b, a, null);
	refreshComponent(b)
}
function handleDocumentMouseDownForSingleColFilter(b) {
	var a = window.event ? window.event.srcElement : b.target;
	if (a == null) {
		hideSingleColFilterSelectBox()
	} else {
		while (a != null) {
			try {
				if (a.getAttribute("id") == COL_FILTER_btnObj.obj.spanOutputId) {
					return
				}
				a = a.parentNode
			} catch (c) {
				break
			}
		}
		hideSingleColFilterSelectBox()
	}
}
function hideSingleColFilterSelectBox() {
	if (COL_FILTER_btnObj != null) {
		document.getElementById(COL_FILTER_btnObj.obj.spanOutputId).style.display = "none";
		COL_FILTER_btnObj.obj.currentValueSelected = -1
	}
	EventTools.removeEventHandler(window.document, "mousedown",
			handleDocumentMouseDownForSingleColFilter)
}
var WX_colSeletedParamsObj = null;
function createTreeObjHtml(c, b, L) {
	var h = document;
	var H = getObjectByJsonString(b);
	var p = H.skin;
	var f = H.webroot;
	var k = H.reportguid;
	var E = getReportMetadataObj(k);
	var l = {
		metadataObj : E,
		paramsObj : H
	};
	if (WX_colSeletedParamsObj == null) {
		WX_colSeletedParamsObj = new Object()
	}
	WX_colSeletedParamsObj[k] = l;
	var F = H.showreport_onpage_url;
	var w = H.showreport_dataexport_url;
	var t = null;
	if (F == null || w == null || w == "" || F == w) {
		t = h.getElementById(k + "_page_col_titlelist")
	} else {
		t = h.getElementById(k + "_dataexport_col_titlelist")
	}
	if (t == null) {
		return
	}
	var g = t.getElementsByTagName("ITEM");
	var r;
	var z;
	var C;
	var K;
	var B;
	var d;
	var s;
	var u;
	var D;
	var G = f + "webresources/skin/" + p + "/images/coltitle_selected/";
	var n = '{img_rooturl:"' + G + '"';
	n = n + ',checkbox:"true"';
	n = n + ',treenodeimg:"true"';
	n = n + ",nodes:[";
	var v = "";
	for (var J = 0, o = g.length; J < o; J = J + 1) {
		r = g[J];
		C = r.getAttribute("nodeid");
		n = n + '{nodeid:"' + C + '"';
		n = n + ',title:"' + r.getAttribute("title") + '"';
		K = r.getAttribute("parentgroupid");
		if (K != null && K != "") {
			n = n + ',parentgroupid:"' + K + '"';
			v = v + C + ':"' + K + '",'
		}
		B = r.getAttribute("childids");
		if (B && B != "") {
			n = n + ',childids:"' + B + '"'
		}
		d = parseInt(r.getAttribute("layer"), 10);
		if (!d) {
			d = 0
		}
		n = n + ',layer:"' + d + '"';
		s = r.getAttribute("checked");
		if (!s) {
			s = "false"
		}
		n = n + ',checked:"' + s + '"';
		u = r.getAttribute("isControlCol");
		if (u == "true") {
			D = "hidden"
		} else {
			D = r.getAttribute("always");
			if (D == null) {
				D = "false"
			}
		}
		n = n + ',isalway:"' + D + '"';
		n = n + "},"
	}
	if (n.lastIndexOf(",") == n.length - 1) {
		n = n.substring(0, n.length - 1)
	}
	n = n + "]";
	if (v.lastIndexOf(",") == v.length - 1) {
		v = v.substring(0, v.length - 1)
	}
	n = n + ",parentidsMap:{" + v + "}";
	n = n + "}";
	var m = '<ul class="bbit-tree-root bbit-tree-lines">';
	m = m + showTreeNodes(n);
	m = m + "</ul>";
	var I = h.getElementById("wx_titletree_content");
	I.innerHTML = m;
	h.getElementById("wx_titletree_buttoncontainer").innerHTML = '<img src="'
			+ G + 'submit.gif" onclick="okSelected(\'' + k + "')\">";
	var x = getElementAbsolutePosition(c);
	var a = h.getElementById("wx_titletree_container");
	if (H.width != null && H.width > 0) {
		a.style.width = H.width + "px"
	}
	a.style.display = "";
	var q = H.maxheight;
	if (q == null || q < 15) {
		q = 350
	}
	if (I.offsetHeight < q - 10) {
		h.getElementById("titletree_container_inner").style.height = (I.offsetHeight + 10)
				+ "px"
	} else {
		h.getElementById("titletree_container_inner").style.height = q + "px"
	}
	var M = L || window.event;
	var y = getDocumentSize();
	var j = y.width - M.clientX;
	var A = y.height - M.clientY;
	if (j < a.offsetWidth) {
		a.style.left = (x.left - a.offsetWidth) + "px"
	} else {
		a.style.left = (x.left + x.width) + "px"
	}
	if (A < a.offsetHeight && M.clientY > a.offsetHeight) {
		a.style.top = (x.top - a.offsetHeight + x.height) + "px"
	} else {
		a.style.top = (x.top) + "px"
	}
	EventTools.addEventHandler(window.document, "mousedown",
			handleDocumentMouseDownForSelectedTree)
}
function okSelected(d) {
	var o = document;
	var j = WX_colSeletedParamsObj[d];
	var m = "";
	var l;
	var h;
	var c;
	var e = false;
	var n = j.paramsObj.showreport_onpage_url;
	var r = j.paramsObj.showreport_dataexport_url;
	var a = n == null || r == null || r == "" || n == r;
	var g = null;
	if (a) {
		g = o.getElementById(d + "_page_col_titlelist")
	} else {
		g = o.getElementById(d + "_dataexport_col_titlelist")
	}
	var q = g.getElementsByTagName("ITEM");
	for (var f = 0, k = q.length; f < k; f++) {
		nodeItemObj = q[f];
		c = nodeItemObj.getAttribute("nodeid");
		h = o.getElementById(c);
		if (h == null) {
			continue
		}
		l = h.getAttribute("checked");
		if (l && l == "true") {
			m = m + c + ";";
			if (!e && nodeItemObj.getAttribute("isNonFixedCol") == "true") {
				e = true
			}
		}
	}
	if (!e) {
		wx_warn("\u81f3\u5c11\u9009\u4e2d\u4e00\u4e2a\u975e\u51bb\u7ed3\u6570\u636e\u5217");
		return false
	}
	if (m.lastIndexOf(";") == m.length - 1) {
		m = m.substring(0, m.length - 1)
	}
	if (m == "") {
		wx_warn("\u8bf7\u9009\u62e9\u8981\u663e\u793a/\u4e0b\u8f7d\u7684\u5217");
		return false
	}
	var p = j.metadataObj;
	var b = getComponentUrl(p.pageid, p.refreshComponentGuid, p.slave_reportid);
	b = replaceUrlParamValue(b, p.reportid + "_DYNDISPLAY_COLIDS", m);
	b = replaceUrlParamValue(b, p.reportid + "_DYNDISPLAY_COLIDS_ACTION",
			"true");
	if (a) {
		refreshComponent(b, null, {
			keepSelectedRowsAction : true,
			keepSavingRowsAction : false
		})
	} else {
		b = addSelectedRowDataToUrl(p.pageid, p.reportid, b);
		exportData(p.pageid, p.reportid, j.paramsObj.includeApplicationids, n,
				r, b)
	}
	closeSelectedTree()
}
var WX_rootTreeNodeId = "root_treenode_id";
function showTreeNodes(params) {
	var paramsObj = eval("(" + params + ")");
	var img_rooturl = paramsObj.img_rooturl;
	var nodes = paramsObj.nodes;
	if (!nodes || nodes.length == 0) {
		return ""
	}
	var parentidsMap = paramsObj.parentidsMap;
	var nodeItemObj;
	var str = "";
	var hasAlwaysChild = false;
	var hasCheckedChild = false;
	var rootChilds = "";
	var endGroupNodesObj = new Object();
	var showCheckBox = paramsObj.checkbox;
	var showTreeNodeImg = paramsObj.treenodeimg;
	for (var i = 0; i < nodes.length; i = i + 1) {
		nodeItemObj = nodes[i];
		id = nodeItemObj.nodeid;
		title = nodeItemObj.title;
		parentgroupid = nodeItemObj.parentgroupid;
		if (!parentgroupid || parentgroupid == ""
				|| parentgroupid == WX_rootTreeNodeId) {
			parentgroupid = WX_rootTreeNodeId;
			rootChilds = rootChilds + id + ","
		}
		childids = nodeItemObj.childids;
		if (!childids) {
			childids = ""
		}
		layer = parseInt(nodeItemObj.layer);
		if (!layer) {
			layer = 0
		}
		checked = nodeItemObj.checked;
		if (!checked) {
			checked = "false"
		}
		if (checked == "true") {
			hasCheckedChild = true
		}
		isalway = nodeItemObj.isalway;
		if (isalway == "hidden") {
			continue
		}
		if (isalway == null) {
			isalway = "false"
		}
		if (isalway == "true") {
			hasAlwaysChild = true
		}
		str = str + "<div ";
		str = str + ' title="' + title + '" id="' + id + '" parentgroupid="'
				+ parentgroupid + '" childids="' + childids + '" layer="'
				+ layer + '" always="' + isalway + '" checked="' + checked
				+ '">';
		var imgname = "";
		var layerLine = "";
		if (parentidsMap && parentgroupid != WX_rootTreeNodeId) {
			var parentid = parentidsMap[parentgroupid];
			while (true) {
				if (!parentid || parentid == "") {
					parentid = WX_rootTreeNodeId
				}
				var isEnd = endGroupNodesObj[parentid];
				if (!isEnd || isEnd != "true") {
					imgname = "elbow-line.gif"
				} else {
					imgname = "elbow-line-none.gif"
				}
				layerLine = "<img style='vertical-align:middle;' src=\""
						+ img_rooturl + imgname + '">' + layerLine;
				if (parentid == WX_rootTreeNodeId) {
					break
				}
				parentid = parentidsMap[parentid]
			}
		}
		str = str + layerLine;
		str = str + "<img ";
		if (isLastNodeInThisLayer(parentgroupid, i, nodes)) {
			imgname = "elbow-end.gif";
			endGroupNodesObj[parentgroupid] = "true"
		} else {
			imgname = "elbow.gif"
		}
		str = str + " style='vertical-align:middle;' src=\"" + img_rooturl
				+ imgname + '">';
		if (showTreeNodeImg && showTreeNodeImg == "true") {
			if (childids && childids != "") {
				imgname = "folder-open.gif"
			} else {
				imgname = "leaf.gif"
			}
			str = str + "<img  style='vertical-align:middle;' src=\""
					+ img_rooturl + imgname + '">'
		}
		if (showCheckBox && showCheckBox == "true") {
			if (isalway && isalway == "true") {
				imgname = "checkbox_3.gif"
			} else {
				if (checked && checked == "true") {
					imgname = "checkbox_1.gif"
				} else {
					imgname = "checkbox_0.gif"
				}
			}
			str = str + '<img id="' + id
					+ "_cb\" style='vertical-align:middle;'";
			if (!isalway || isalway == "false") {
				str = str + " onclick=\"processTreeNodeselected(this.id,'"
						+ img_rooturl + "')\""
			}
			str = str + ' src="' + img_rooturl + imgname + '">'
		}
		str = str + title;
		str = str + "</div>"
	}
	if (rootChilds.lastIndexOf(",") == rootChilds.length - 1) {
		rootChilds = rootChilds.substring(0, rootChilds.length - 1)
	}
	var rootstr = '<div id="' + WX_rootTreeNodeId + '" childids="' + rootChilds
			+ '" always="' + hasAlwaysChild + '" checked="' + hasCheckedChild
			+ "\"><img style='vertical-align:middle;' src=\"" + img_rooturl
			+ 'root.gif">';
	if (showCheckBox && showCheckBox == "true") {
		var rootnodecheckimg = "";
		if (hasAlwaysChild == true) {
			rootnodecheckimg = "checkbox_3.gif"
		} else {
			if (hasCheckedChild == true) {
				rootnodecheckimg = "checkbox_1.gif"
			} else {
				rootnodecheckimg = "checkbox_0.gif"
			}
		}
		rootstr = rootstr + '<img id="' + WX_rootTreeNodeId
				+ "_cb\" style='vertical-align:middle;'";
		if (hasAlwaysChild != true) {
			rootstr = rootstr + " onclick=\"processTreeNodeselected(this.id,'"
					+ img_rooturl + "')\""
		}
		rootstr = rootstr + ' src="' + img_rooturl + rootnodecheckimg + '">'
	}
	rootstr = rootstr + "</div>";
	str = rootstr + str;
	return str
}
function handleDocumentMouseDownForSelectedTree(b) {
	var a = window.event ? window.event.srcElement : b.target;
	if (a == null || !isElementOrChildElement(a, "wx_titletree_container")) {
		closeSelectedTree()
	}
}
function closeSelectedTree() {
	document.getElementById("wx_titletree_container").style.display = "none";
	EventTools.removeEventHandler(window.document, "mousedown",
			handleDocumentMouseDownForSelectedTree)
}
function isLastNodeInThisLayer(a, c, b) {
	if (c == b.length - 1) {
		return true
	}
	if (!a) {
		a = ""
	}
	var f;
	for (var e = c + 1; e < b.length; e++) {
		f = b[e].parentgroupid;
		var d = b[e].isalway;
		if (d == "hidden") {
			continue
		}
		if (!f || f == "") {
			f = WX_rootTreeNodeId
		}
		if (f != a) {
			continue
		}
		return false
	}
	return true
}
function processTreeNodeselected(b, e) {
	var a = document.getElementById(b);
	var f = document.getElementById(b.substring(0, b.indexOf("_cb")));
	var c;
	var d = f.getAttribute("checked");
	if (d && d == "true") {
		c = false;
		a.src = e + "checkbox_0.gif";
		f.setAttribute("checked", "false")
	} else {
		c = true;
		a.src = e + "checkbox_1.gif";
		f.setAttribute("checked", "true")
	}
	processChildNodesSelected(f, c, e);
	processParentNodesSelected(f, c, e)
}
function processChildNodesSelected(h, c, g) {
	var a = h.getAttribute("childids");
	if (a && a != "") {
		var b = a.split(",");
		var f;
		var e;
		for (var d = 0; d < b.length; d++) {
			if (b[d] == "") {
				continue
			}
			f = document.getElementById(b[d]);
			if (!f) {
				continue
			}
			e = document.getElementById(b[d] + "_cb");
			if (!e) {
				continue
			}
			if (c) {
				e.src = g + "checkbox_1.gif";
				f.setAttribute("checked", "true")
			} else {
				e.src = g + "checkbox_0.gif";
				f.setAttribute("checked", "false")
			}
			processChildNodesSelected(f, c, g)
		}
	}
}
function processParentNodesSelected(l, j, m) {
	var n = l.getAttribute("parentgroupid");
	if (n && n != "") {
		var d = document.getElementById(n);
		if (!d) {
			return
		}
		var a = d.getAttribute("always");
		if (a && a == "true") {
			return
		}
		if (j) {
			d.setAttribute("checked", "true");
			var g = document.getElementById(n + "_cb");
			g.src = m + "checkbox_1.gif"
		} else {
			var b = d.getAttribute("childids");
			var k = b.split(",");
			var f;
			var e = false;
			var h;
			for (var c = 0; c < k.length; c++) {
				if (k[c] == "") {
					continue
				}
				f = document.getElementById(k[c]);
				if (!f) {
					continue
				}
				h = f.getAttribute("checked");
				if (h && h == "true") {
					e = true;
					break
				}
			}
			if (!e) {
				d.setAttribute("checked", "false");
				var g = document.getElementById(n + "_cb");
				g.src = m + "checkbox_0.gif"
			}
		}
		processParentNodesSelected(d, j, m)
	}
}
function expandOrCloseTreeNode(h, o, s, l, c) {
	var j = getTrObjOfTreeGroupRow(s);
	var n;
	var a = j.getAttribute("childDataIdSuffixes");
	var q = j.getAttribute("childGroupIdSuffixes");
	if (!a || a == "") {
		n = q
	} else {
		if (!q || q == "") {
			n = a
		} else {
			n = q + ";" + a
		}
	}
	if (n == null || n == "") {
		return false
	}
	var f = j.getAttribute("state");
	if (!f || f == "") {
		f = "open"
	}
	var g = document.getElementById(j.getAttribute("id") + "_img");
	if (f == "open") {
		j.setAttribute("state", "close");
		g.src = h + "webresources/skin/" + o + "/images/nodeclosed.gif"
	} else {
		j.setAttribute("state", "open");
		g.src = h + "webresources/skin/" + o + "/images/nodeopen.gif"
	}
	var m = new Object();
	var t = n.split(";");
	for (var p = 0; p < t.length; p = p + 1) {
		if (t[p] == "") {
			continue
		}
		var b = document.getElementById(l + t[p]);
		if (!b) {
			continue
		}
		var d = isExistParentStateClosed(l, b, m);
		if (!d) {
			b.style.display = ""
		} else {
			b.style.display = "none"
		}
	}
	if (c && c != "") {
		try {
			var k = document.getElementById(c);
			if (k) {
				k.fleXcroll.updateScrollBars()
			}
		} catch (r) {
		}
	}
}
function isExistParentStateClosed(f, e, d) {
	var b = e.getAttribute("parentTridSuffix");
	if (!b || b == "") {
		return false
	}
	if (d[b]) {
		return d[b] == "1"
	}
	var c = document.getElementById(f + b);
	var g = c.getAttribute("state");
	if (g && g == "close") {
		d[b] = "1";
		return true
	}
	var a = isExistParentStateClosed(f, c, d);
	if (a) {
		d[b] = "1"
	} else {
		d[b] = "0"
	}
	return d[b] == "1"
}
function getTrObjOfTreeGroupRow(b) {
	var a = b.parentNode;
	if (!a) {
		return null
	}
	if (a.tagName == "TR") {
		var c = a.getAttribute("id");
		if (c && c.indexOf("trgroup_") > 0) {
			return a
		}
	}
	return getTrObjOfTreeGroupRow(a)
}
function exportData(j, r, o, m, b, d, g) {
	if (o == null || o == "") {
		return
	}
	if (d == null || d == "") {
		var h = new Array();
		var f = o.split(";");
		var a = new Object();
		for (var p = 0, q = f.length; p < q; p++) {
			if (f[p] != null && f[p] != "" && a[f] != "true") {
				a[f[p]] = "true";
				h[h.length] = f[p]
			}
		}
		if (h != null && h.length == 1) {
			var e = getComponentGuidById(j, h[0]);
			var n = getReportMetadataObj(e);
			if (n == null) {
				d = getComponentUrl(j, null, null)
			} else {
				d = getComponentUrl(j, n.refreshComponentGuid, n.slave_reportid)
			}
			if (g === true) {
				d = replaceUrlParamValue(d, n.reportid + "_DYNDISPLAY_COLIDS",
						"")
			}
			d = addSelectedRowDataToUrl(j, h[0], d)
		} else {
			d = getComponentUrl(j, null, null);
			var l = null;
			var c = null;
			var s = null;
			for (var p = 0, q = h.length; p < q; p++) {
				c = getComponentGuidById(j, h[p]);
				l = getReportMetadataObj(c);
				if (l == null || l.slave_reportid == null
						|| l.slave_reportid == "") {
					continue
				}
				s = getComponentUrl(j, l.refreshComponentGuid, l.slave_reportid);
				d = mergeUrlParams(d, s, false);
				d = addSelectedRowDataToUrl(j, h[p], d)
			}
		}
	}
	d = replaceUrlParamValue(d, "COMPONENTIDS", r);
	d = replaceUrlParamValue(d, "INCLUDE_APPLICATIONIDS", o);
	if (m.indexOf("?") > 0) {
		if (m.lastIndexOf("&") != m.length - 1) {
			m = m + "&"
		}
	} else {
		if (m.lastIndexOf("?") != m.length - 1) {
			m = m + "?"
		}
	}
	if (b.indexOf("?") > 0) {
		if (b.lastIndexOf("&") != b.length - 1) {
			b = b + "&"
		}
	} else {
		if (b.lastIndexOf("?") != b.length - 1) {
			b = b + "?"
		}
	}
	var k = d.indexOf(m);
	d = d.substring(0, k) + b + d.substring(k + m.length);
	postlinkurl(d, true)
}
function addSelectedRowDataToUrl(b, f, a) {
	var j = getListReportSelectedTrDatas(b, f, false, false, false);
	var e = null;
	if (j != null && j.length > 0) {
		e = "";
		var h;
		for (var d = 0, g = j.length; d < g; d++) {
			h = j[d];
			var c = "";
			for ( var k in h) {
				if (h[k] == null || h[k] == "") {
					continue
				}
				if (h[k].value == null) {
					h[k].value = ""
				}
				c += k + SAVING_NAMEVALUE_SEPERATOR + h[k].value
						+ SAVING_COLDATA_SEPERATOR
			}
			if (c.lastIndexOf(SAVING_COLDATA_SEPERATOR) == c.length
					- SAVING_COLDATA_SEPERATOR.length) {
				c = c.substring(0, c.length - SAVING_COLDATA_SEPERATOR.length)
			}
			if (c != "") {
				e += c + SAVING_ROWDATA_SEPERATOR
			}
		}
		if (e.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == e.length
				- SAVING_ROWDATA_SEPERATOR.length) {
			e = e.substring(0, e.length - SAVING_ROWDATA_SEPERATOR.length)
		}
	}
	a = replaceUrlParamValue(a,
			getComponentGuidById(b, f) + "_allselectedatas", e);
	return a
}
function mergeUrlParams(l, h, f) {
	if (l == null || l == "") {
		return h
	}
	if (h == null || h == "") {
		return l
	}
	var g = splitUrlAndParams(l, false);
	var d = splitUrlAndParams(h, false);
	var j = g[0];
	var e = g[1];
	var c = d[1];
	if (c == null) {
		return l
	}
	var b = null;
	var a = null;
	if (f) {
		b = c;
		a = e
	} else {
		b = e;
		a = c
	}
	var i = "?";
	if (b != null) {
		for ( var k in b) {
			j = j + i + k + "=" + b[k];
			i = "&";
			if (a != null) {
				delete a[k]
			}
		}
	}
	if (a != null) {
		for ( var k in a) {
			j = j + i + k + "=" + a[k];
			i = "&"
		}
	}
	return j
}
function wx_showChildSelectboxOptionsOnload(a) {
	if (a == null || a.childids == null || a.childids == "") {
		return
	}
	wx_reloadChildSelectBoxOptions(a.childids, true)
}
function wx_reloadChildSelectBoxOptionsByParentInputbox(e) {
	var b = getInputboxIdByParentElementObj(getInputboxParentElementObj(e));
	var a = getInputboxMetadataObj(b);
	if (a == null) {
		return
	}
	var c = a.getAttribute("childboxids");
	if (c == null || c == "") {
		return
	}
	var d = getRowIndexByRealInputboxId(b);
	if (d >= 0) {
		c = changeToRealInputBoxids(c, d)
	}
	wx_reloadChildSelectBoxOptions(c, false)
}
function changeToRealInputBoxids(c, h) {
	if (c == null || c == "" || h < 0) {
		return c
	}
	var f = "";
	var g = c.split(";");
	var e, d;
	for (var b = 0, a = g.length; b < a; b++) {
		e = g[b];
		if (e == null || e == "") {
			continue
		}
		d = e.lastIndexOf("__");
		if (d <= 0) {
			e += "__" + h
		}
		f += e + ";"
	}
	return f
}
function wx_reloadChildSelectBoxOptions(a, x) {
	if (a == null || a == "") {
		return
	}
	var m = a.split(";");
	if (m == null || m.length == 0) {
		return
	}
	var u, n, p;
	var c, q, o, k;
	var v = "";
	var d = null;
	var l = null;
	var g = "";
	for (var s = 0, t = m.length; s < t; s++) {
		p = m[s];
		if (p == null || p == "") {
			continue
		}
		u = getReportGuidByInputboxId(p);
		n = getReportMetadataObj(u);
		if (n == null) {
			continue
		}
		if (d == null) {
			l = n.pageid;
			d = getComponentUrl(l, n.refreshComponentGuid, n.slave_reportid);
			if (d == null || d == "") {
				continue
			}
		}
		c = getInputboxMetadataObj(p);
		if (c == null) {
			continue
		}
		o = c.getAttribute("parentids");
		if (o == null || o == "") {
			continue
		}
		q = c.getAttribute("isconditionbox") === "true";
		if (q === true) {
			g += p + ";";
			var w = o.split(";");
			var f, b;
			for (var r = 0, e = w.length; r < e; r++) {
				b = w[r];
				f = document.getElementById(u + "_wxcondition_" + b);
				if (f == null) {
					continue
				}
				d = replaceUrlParamValue(d, b,
						wx_getConditionValue(getInputboxParentElementObj(f)))
			}
		} else {
			var h = createEditableSelectBoxParams(n, p, o);
			if (h != "") {
				v += h + SAVING_ROWDATA_SEPERATOR
			}
		}
	}
	if (g != "") {
		v += "conditionSelectboxIds" + SAVING_NAMEVALUE_SEPERATOR + g
	}
	if (v.indexOf(SAVING_ROWDATA_SEPERATOR) > 0
			&& v.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == v.length
					- SAVING_ROWDATA_SEPERATOR.length) {
		v = v.substring(0, v.length - SAVING_ROWDATA_SEPERATOR.length)
	}
	d = replaceUrlParamValue(d, "SELECTBOXIDS_AND_PARENTVALUES", v);
	d = replaceUrlParamValue(d, "ACTIONTYPE", "GetSelectBoxDataList");
	sendAsynRequestToServer(d, refreshSelectBoxData,
			onRefreshSelectBoxDataErrorMethod, x)
}
function createEditableSelectBoxParams(h, c, i) {
	var f = wx_getAllSiblingColValuesByInputboxid(c, i);
	var d = "";
	if (f != null) {
		var b, e;
		for ( var g in f) {
			b = f[g];
			if (b == null) {
				continue
			}
			e = b.value;
			if (e == null) {
				e = ""
			}
			d += g + SAVING_NAMEVALUE_SEPERATOR + e + SAVING_COLDATA_SEPERATOR
		}
		if (d.lastIndexOf(SAVING_COLDATA_SEPERATOR) == d.length
				- SAVING_COLDATA_SEPERATOR.length) {
			d = d.substring(0, d.length - SAVING_COLDATA_SEPERATOR.length)
		}
	}
	if (d == null || d == "") {
		return ""
	}
	var a = "wx_inputboxid" + SAVING_NAMEVALUE_SEPERATOR + c;
	a += SAVING_COLDATA_SEPERATOR + d;
	return a
}
function refreshSelectBoxData(xmlHttpObj, isRefreshOptionInitially) {
	var resultData = xmlHttpObj.responseText;
	if (resultData == null || resultData == " " || resultData == "") {
		return
	}
	var resultDataObj = null;
	try {
		resultDataObj = eval("(" + resultData + ")")
	} catch (e) {
		wx_error("\u83b7\u53d6\u5b50\u9009\u62e9\u6846\u9009\u9879\u5931\u8d25");
		throw e
	}
	var pageid = resultDataObj.pageid;
	delete resultDataObj.pageid;
	var metadataObjTmp = null;
	var mRefreshChildIds = new Object();
	var optionsArrTmp, boxMetadataObjTmp;
	var refreshedComboxObjs = new Object();
	for ( var selectboxid in resultDataObj) {
		optionsArrTmp = resultDataObj[selectboxid];
		boxMetadataObjTmp = getInputboxMetadataObj(selectboxid);
		if (boxMetadataObjTmp == null) {
			continue
		}
		metadataObjTmp = getReportMetadataObj(getReportGuidByInputboxId(selectboxid));
		if (metadataObjTmp == null) {
			continue
		}
		var selectboxtype = boxMetadataObjTmp.getAttribute("selectboxtype");
		if (selectboxtype == "combox") {
			refreshedComboxObjs[selectboxid] = {
				options : optionsArrTmp,
				metadataObj : metadataObjTmp
			}
		} else {
			if (selectboxtype == "selectbox") {
				filledChildSelectboxOptions(metadataObjTmp, selectboxid,
						optionsArrTmp, selectboxtype, isRefreshOptionInitially)
			} else {
				if (selectboxtype == "checkbox" || selectboxtype == "radio") {
					filledChildChkRadioboxOptions(metadataObjTmp, selectboxid,
							optionsArrTmp, selectboxtype,
							isRefreshOptionInitially)
				} else {
					continue
				}
			}
		}
		if (boxMetadataObjTmp.getAttribute("displayonclick") !== "true") {
			addRefreshedChildBoxIds(mRefreshChildIds, boxMetadataObjTmp
					.getAttribute("childboxids"),
					getRowIndexByRealInputboxId(selectboxid))
		}
	}
	for ( var selectboxid in refreshedComboxObjs) {
		filledChildSelectboxOptions(
				refreshedComboxObjs[selectboxid].metadataObj, selectboxid,
				refreshedComboxObjs[selectboxid].options, "combox",
				isRefreshOptionInitially)
	}
	refreshAllChildSelectboxs(mRefreshChildIds, isRefreshOptionInitially)
}
function addRefreshedChildBoxIds(f, b, g) {
	if (b == null || b == "") {
		return
	}
	var e = b.split(";");
	var c;
	for (var d = 0, a = e.length; d < a; d++) {
		c = e[d];
		if (c == null || c == "") {
			continue
		}
		if (g >= 0) {
			c += "__" + g
		}
		if (f[c] === true) {
			continue
		}
		f[c] = true
	}
}
function refreshAllChildSelectboxs(d, a) {
	if (d == null) {
		return
	}
	var c = "";
	for ( var b in d) {
		if (d[b] === true) {
			c += b + ";"
		}
	}
	if (c != "" && c.length > 0) {
		wx_reloadChildSelectBoxOptions(c, a)
	}
}
function filledChildSelectboxOptions(m, b, d, o, h) {
	var a = document.getElementById(b);
	if (o == "combox") {
		a = getSelectBoxObjOfCombox(a)
	}
	if (a == null) {
		return
	}
	var f = getInputboxMetadataObj(a.getAttribute("id"));
	var e = f.getAttribute("displayonclick") === "true";
	var n = null;
	if (e === true || h === true) {
		var g = getInputboxParentElementObj(a);
		g = getUpdateColDestObj(g, m.reportguid, g);
		n = g.getAttribute("value")
	} else {
		n = getInputBoxValue(a)
	}
	if (a.options.length > 0) {
		for (var k = 0, c = a.options.length; k < c; k++) {
			a.remove(a.options[k])
		}
	}
	var j = false;
	if (d != null && d.length > 0) {
		var l;
		for (var k = 0; k < d.length; k++) {
			l = new Option(d[k].label, d[k].value);
			a.options.add(l);
			if (isSelectedValueForSelectedBox(n, d[k].value, a)) {
				l.selected = true;
				j = true
			}
		}
	}
	if (o == "combox") {
		$("#" + a.getAttribute("id")).refreshSelectbox();
		if (j !== true) {
			if (n == null) {
				n = ""
			}
			getTextBoxObjOfCombox(a).value = n
		}
	}
	if (j !== true && !e && !h && f.getAttribute("isconditionbox") !== "true") {
		addInputboxDataForSaving(m.reportguid, a)
	}
}
function filledChildChkRadioboxOptions(p, b, c, r, g) {
	var e = getInputboxMetadataObj(b);
	var d = e.getAttribute("displayonclick") === "true";
	if (d === true) {
		var n = null;
		var o = b.lastIndexOf("__");
		if (o > 0) {
			n = b.substring(0, o) + "__td" + b.substring(o + 2)
		} else {
			n = b + "__td"
		}
		var a = document.getElementById(n);
		var l = getUpdateColDestObj(a, p.reportguid, a).getAttribute("value");
		setColDisplayValueToEditable2Td(a, "<span id='" + b + "_group'>"
				+ getChkRadioBoxOptionsDisplayString(e, c, b, l, r) + "</span>");
		doPostFilledInContainer(a)
	} else {
		var m = document.getElementById(b + "_group");
		var l = null;
		if (g === true) {
			var f = getInputboxParentElementObj(m);
			f = getUpdateColDestObj(f, p.reportguid, f);
			l = f.getAttribute("value")
		} else {
			l = getInputBoxValueById(b)
		}
		m.innerHTML = getChkRadioBoxOptionsDisplayString(e, c, b, l, r);
		if (!g && e.getAttribute("isconditionbox") !== "true") {
			var q = null, j = false;
			for (var h = 0, k = c.length; h < k; h++) {
				q = c[h].value;
				if (isSelectedValueForSelectedBox(l, q, e)) {
					j = true;
					break
				}
			}
			if (j != true) {
				addDataForSaving(p.reportguid, m)
			}
		}
	}
}
function getChkRadioBoxOptionsDisplayString(b, a, l, e, m) {
	var j = b.getAttribute("styleproperty");
	j = j == null ? "" : paramdecode(j);
	var h = b.getAttribute("inline_count");
	var g = (h != null && h != "") ? parseInt(h, 10) : 0;
	var f = "";
	if (a == null || a.length == 0) {
		if (b.getAttribute("displayonclick") === "true") {
			f += "<input type='" + m + "'";
			f += " id= '" + l + "' name='" + l + "'";
			f += " " + j;
			f += "></input>"
		}
	} else {
		var k = null, n = null;
		for (var c = 0, d = a.length; c < d; c++) {
			k = a[c].label;
			n = a[c].value;
			if (k == null) {
				k = ""
			}
			if (n == null) {
				n = ""
			}
			if (k == "" && n == "") {
				continue
			}
			f += "<input type='" + m + "'  value='" + n + "' label='" + k + "'";
			f += " id= '" + l + "' name='" + l + "'";
			f += " " + j;
			if (isSelectedValueForSelectedBox(e, n, b)) {
				f += " checked"
			}
			f += ">" + k + "</input>";
			if (g > 0 && c > 0 && c % g == 0) {
				f += "<br>"
			}
		}
	}
	return f
}
function getSelectBoxOptionsFromMetadata(d) {
	if (d == null) {
		return null
	}
	var c = d.getElementsByTagName("span");
	if (c == null || c.length == 0) {
		return null
	}
	var b = null, f = null;
	var g = new Array();
	for (var e = 0, a = c.length; e < a; e++) {
		b = c[e].getAttribute("label");
		f = c[e].getAttribute("value");
		if (b == null) {
			b = ""
		}
		if (f == null) {
			f = ""
		}
		g[g.length] = {
			label : b,
			value : f
		}
	}
	return g
}
function onRefreshSelectBoxDataErrorMethod(a) {
	wx_error("\u83b7\u53d6\u5b50\u9009\u62e9\u6846\u9009\u9879\u6570\u636e\u5931\u8d25")
}
function isSelectedValueForSelectedBox(d, c, f) {
	if (d == null || c == null) {
		return false
	}
	var e = f.getAttribute("separator");
	if (e == null || e == "") {
		return d == c
	} else {
		if (d == c) {
			return true
		}
		if (e != " ") {
			d = wx_trim(d)
		}
		var a = d.split(e);
		for (var b = 0; b < a.length; b++) {
			if (a[b] == c) {
				return true
			}
		}
		return false
	}
}
function popupPageByPopupInputbox(f) {
	var e = f.value;
	if (e == null) {
		e = ""
	}
	var m = f.getAttribute("id");
	if (m == null || m == "") {
		return
	}
	var g = getInputboxMetadataObj(m);
	if (g == null) {
		return
	}
	var j = g.getAttribute("paramsOfGetPageUrl");
	var h = getObjectByJsonString(j);
	if (h == null) {
		wx_warn("\u6ca1\u6709\u53d6\u5230id\u4e3a"
				+ m
				+ "\u7684\u5f39\u51fa\u8f93\u5165\u6846\u53c2\u6570\uff0c\u65e0\u6cd5\u5f39\u51fa\u7a97\u53e3");
		return
	}
	var c = h.pageid;
	var i = h.reportid;
	var d = h.popupPageUrl;
	var b = getComponentGuidById(c, i);
	var l = getReportMetadataObj(b);
	if (l == null) {
		return
	}
	var k = h.popupPageUrlParams;
	if (k != null) {
		d = parseDynColParamsInPopupUrl(l, f, d, k)
	}
	var a = (d.indexOf("?") > 0) ? "&" : "?";
	d += a + "SRC_PAGEID=" + c;
	d += "&SRC_REPORTID=" + i;
	d += "&INPUTBOXID=" + m;
	d += "&OLDVALUE=" + encodeURIComponent(e);
	wx_winpage(d, getObjectByJsonString(h.popupparams), h.beforePopupMethod, f)
}
function popupPageByFileUploadInputbox(j) {
	var o = j.getAttribute("id");
	if (o == null || o == "") {
		return
	}
	var h = getInputboxMetadataObj(o);
	if (h == null) {
		return
	}
	var m = h.getAttribute("paramsOfGetPageUrl");
	var a = h.getAttribute("displaytype");
	if (a == null || a == "") {
		a = "textbox"
	}
	var g = null;
	if (a == "image") {
		g = j.getAttribute("srcpath")
	} else {
		g = j.value
	}
	if (g == null) {
		g = ""
	}
	var k = getObjectByJsonString(m);
	if (k == null) {
		wx_warn("\u6ca1\u6709\u53d6\u5230id\u4e3a"
				+ o
				+ "\u7684\u6587\u4ef6\u4e0a\u4f20\u8f93\u5165\u6846\u53c2\u6570\uff0c\u65e0\u6cd5\u5f39\u51fa\u7a97\u53e3");
		return
	}
	var d = k.pageid;
	var l = k.reportid;
	var e = k.popupPageUrl;
	var c = getComponentGuidById(d, l);
	var n = getReportMetadataObj(c);
	if (n == null) {
		return
	}
	var f = WXConfig.showreport_url;
	var b = f.indexOf("?") > 0 ? "&" : "?";
	if (e != null && e != "") {
		var i = k.popupPageUrlParams;
		if (i != null) {
			e = parseDynColParamsInPopupUrl(n, j, e, i)
		}
		f += b + e;
		b = "&"
	}
	f += b + "PAGEID=" + d + "&REPORTID=" + l + "&INPUTBOXID=" + o
			+ "&ACTIONTYPE=ShowUploadFilePage&FILEUPLOADTYPE=fileinputbox";
	f += "&OLDVALUE=" + encodeURIComponent(g);
	wx_winpage(f, getObjectByJsonString(k.popupparams), k.beforePopupMethod, j)
}
function parseDynColParamsInPopupUrl(j, e, c, k) {
	var a = new Object();
	var g;
	for ( var b in k) {
		if (b == null || b == "") {
			continue
		}
		g = b.lastIndexOf("__old");
		if (g > 0 && g == b.length - "__old".length) {
			b = b.substring(0, g)
		}
		a[b] = true
	}
	var d = j.reportfamily;
	var h = null;
	if (d == ReportFamily.EDITABLELIST2 || d == ReportFamily.LISTFORM) {
		var f = getTrDataObj(j.reportguid, e);
		if (f != null) {
			h = wx_getListReportColValuesInRow(f, a)
		}
	} else {
		h = getEditableReportColValues(j.pageid, j.reportid, a, null)
	}
	var i, l;
	for ( var b in k) {
		if (b == null || b == "") {
			continue
		}
		g = b.lastIndexOf("__old");
		i = (g > 0 && g == b.length - "__old".length) ? b.substring(0, g) : b;
		l = null;
		if (h != null && h[i] != null) {
			if (g > 0 && g == b.length - "__old".length) {
				l = h[i].oldvalue
			} else {
				l = h[i].value
			}
		}
		if (l == null) {
			l = ""
		}
		c = c.replace(k[b], l)
	}
	return c
}
function getTrDataObj(a, b) {
	if (b == null) {
		return null
	}
	var c = getParentElementObj(b, "TR");
	while (c != null) {
		if (isEditableListReportTr(a, c)) {
			return c
		}
		c = getParentElementObj(c, "TR")
	}
	return null
}
var WX_PARENT_INPUTBOXID = "";
function setPopUpBoxValueToParent(c, b) {
	var d = document.getElementById(b);
	if (d == null) {
		wx_warn("\u6ca1\u6709\u53d6\u5230id\u4e3a" + b
				+ "\u7684\u5f39\u51fa\u6e90\u8f93\u5165\u6846");
		return false
	}
	WX_PARENT_INPUTBOXID = b;
	if (d.tagName == "IMG") {
		d.src = c;
		d.setAttribute("srcpath", c)
	} else {
		d.value = c
	}
	var a = getReportGuidByInputboxId(b);
	if (b.indexOf(a + "_wxcondition_") < 0) {
		addInputboxDataForSaving(a, d)
	}
	d = document.getElementById(b);
	if (d != null) {
		d.focus()
	}
}
function closePopUpPageEvent(a) {
	if (WX_PARENT_INPUTBOXID && WX_PARENT_INPUTBOXID != "") {
		var b = document.getElementById(WX_PARENT_INPUTBOXID);
		if (b) {
			b.focus()
		}
	}
	WX_PARENT_INPUTBOXID = ""
}
function deleteUploadFilesInvokeCallback(e, b) {
	var d = e.responseText;
	if (d == null || d == "") {
		return
	}
	var a = d.indexOf("|");
	var c = "warn";
	if (a > 0) {
		c = d.substring(0, a);
		d = d.substring(a + 1)
	}
	if (c == "alert") {
		wx_alert(d)
	} else {
		if (c == "warn") {
			wx_warn(d)
		} else {
			if (c == "success") {
				wx_success(d)
			} else {
				if (c == "error") {
					wx_error(d)
				}
			}
		}
	}
}
var WX_contextmenuObj = null;
function showcontextmenu(g, f) {
	if (WX_contextmenuObj != null) {
		WX_contextmenuObj.style.visibility = "hidden"
	}
	WX_contextmenuObj = document.getElementById(g);
	if (WX_contextmenuObj == null) {
		return
	}
	var h = WX_contextmenuObj.getAttribute("isEmpty");
	if (h == "true") {
		return
	}
	var c = f || window.event;
	var i = getDocumentSize();
	var b = i.width - c.clientX;
	var a = i.height - c.clientY;
	var d = getDocumentScroll();
	if (b < WX_contextmenuObj.offsetWidth) {
		WX_contextmenuObj.style.left = (d.scrollLeft + c.clientX - WX_contextmenuObj.offsetWidth)
				+ "px"
	} else {
		WX_contextmenuObj.style.left = (d.scrollLeft + c.clientX) + "px"
	}
	if (a < WX_contextmenuObj.offsetHeight) {
		WX_contextmenuObj.style.top = (d.scrollTop + c.clientY - WX_contextmenuObj.offsetHeight)
				+ "px"
	} else {
		WX_contextmenuObj.style.top = (d.scrollTop + c.clientY) + "px"
	}
	WX_contextmenuObj.style.visibility = "visible";
	if (window.event) {
		c.returnValue = false
	} else {
		c.preventDefault()
	}
	document.onclick = hidecontextmenu;
	return false
}
function hidecontextmenu() {
	WX_contextmenuObj.style.visibility = "hidden"
}
function highlightmenuitem(a) {
	var c = a || window.event;
	var b = c.srcElement || c.target;
	if (b.className == "contextmenuitems_enabled") {
		b.style.backgroundColor = "highlight";
		b.style.color = "white"
	} else {
		if (b.className == "contextmenuitems_disabled") {
			b.style.backgroundColor = "highlight"
		}
	}
}
function lowlightmenuitem(a) {
	var c = a || window.event;
	var b = c.srcElement || c.target;
	if (b.className == "contextmenuitems_enabled") {
		b.style.backgroundColor = "";
		b.style.color = "black"
	} else {
		if (b.className == "contextmenuitems_disabled") {
			b.style.backgroundColor = ""
		}
	}
}
function forwardPageWithBack(b, a, d) {
	a = paramdecode(a);
	var f = document.getElementById(b + "_url_id");
	var c = f.getAttribute("encodevalue");
	if (c == null || c == "") {
		wx_error("\u6ca1\u6709\u53d6\u5230\u672c\u9875\u9762\u7684URL\uff0c\u8df3\u8f6c\u5931\u8d25");
		return
	}
	var e = f.getAttribute("ancestorPageUrls");
	if (e == null || e == "") {
		e = c
	} else {
		e = c + "||" + e
	}
	a = replaceUrlParamValue(a, "ancestorPageUrls", e);
	a = replaceUrlParamValue(a, "refreshComponentGuid", "[OUTERPAGE]" + b);
	a = replaceUrlParamValue(a, "SLAVE_REPORTID", null);
	if (d != null && d != "") {
		a = d(a)
	}
	if (a != null && a != "") {
		refreshComponent(a, null, {
			keepSelectedRowsAction : true,
			keepSavingRowsAction : true
		})
	}
}
function removeLazyLoadParamsFromUrl(a, e, c) {
	a = replaceUrlParamValue(a, e.reportid + "_lazydisplaydata", null);
	a = replaceUrlParamValue(a, e.reportid + "_lazydisplaydata_prompt", null);
	if (c) {
		var g = e.metaDataSpanObj.getAttribute("relateConditionReportIds");
		if (g != null && g != "") {
			var f = g.split(";");
			var d;
			for (var b = 0; b < f.length; b = b + 1) {
				d = f[b];
				if (d == null || d == "") {
					continue
				}
				a = replaceUrlParamValue(a, d + "_lazydisplaydata", null);
				a = replaceUrlParamValue(a, d + "_lazydisplaydata_prompt", null)
			}
		}
	}
	return a
}
function wx_onblurValidate(b, g, j, a, f) {
	var i = getReportMetadataObj(b);
	var k = getInputboxParentElementObj(g);
	if (k == null) {
		wx_alert("\u4f20\u5165\u7684\u6807\u7b7e\u5143\u7d20\u5bf9\u8c61\u4e0d\u5c5e\u4e8e\u8fd9\u4e00\u5217\u6807\u7b7e\u5bf9\u8c61");
		return true
	}
	var d = false;
	if (j === true) {
		d = validateConditionBoxValue(i, getAllConditionValues(b), k, true, a,
				f)
	} else {
		var c = null;
		if (i.reportfamily == ReportFamily.EDITABLELIST2
				|| i.reportfamily == ReportFamily.LISTFORM) {
			c = wx_getListReportColValuesInRow(k.parentNode, null)
		} else {
			c = getEditableReportColValues(getPageIdByComponentGuid(b),
					getComponentIdByGuid(b), null, null)
		}
		var e = new Object();
		if (c != null) {
			for ( var h in c) {
				if (c[h].name == null || c[h].name == "") {
					continue
				}
				e[c[h].name] = c[h].value;
				e[c[h].name + "__old"] = c[h].oldvalue
			}
		}
		d = validateEditColBoxValue(i, e, k, true, a, f)
	}
	return d
}
function validateConditionBoxValue(e, d, g, f, c, b) {
	if (g == null) {
		return true
	}
	var a = g.getAttribute("value_name");
	if (a == null || a == "") {
		return true
	}
	var h = wx_getConditionValue(g);
	if (c === true) {
		return doServerValidateInputBoxValue(e, e.reportguid + "_wxcondition_"
				+ a, g, h, d, f, b)
	} else {
		return doJsValidateInputBoxValue(e, e.reportguid + "_wxcondition_" + a,
				g, h, d, f)
	}
}
function validateEditColBoxValue(f, g, b, h, e, d) {
	if (b == null) {
		return true
	}
	var c = b.getAttribute("value_name");
	if (c == null || c == "") {
		return true
	}
	var a = wx_getColValue(getUpdateColDestObj(b, f.reportguid, b));
	if (e === true) {
		return doServerValidateInputBoxValue(f, f.reportguid + "_wxcol_" + c,
				b, a, g, h, d)
	} else {
		return doJsValidateInputBoxValue(f, f.reportguid + "_wxcol_" + c, b, a,
				g, h)
	}
}
function doJsValidateInputBoxValue(h, e, i, g, c, d) {
	var a = h.metaDataSpanObj.getAttribute("validateType_" + e);
	if ((d && a == "onsubmit") || (!d && a == "onblur")) {
		return true
	}
	var b = getObjectByJsonString(h.metaDataSpanObj
			.getAttribute("validateMethod_" + e));
	if (b == null || b.method == null) {
		return true
	}
	var f = getObjectByJsonString(h.metaDataSpanObj
			.getAttribute("jsValidateParamsObj_" + e));
	if (f == null) {
		f = new Object()
	}
	f.datasObj = c;
	return b.method(h, getInputboxMetadataObj(e), g, i, f, d)
}
function doServerValidateInputBoxValue(i, d, j, g, b, c, f) {
	var k = getComponentUrl(i.pageid, i.refreshComponentGuid, i.slave_reportid);
	k = replaceUrlParamValue(k, "INPUTBOXID", d);
	k = replaceUrlParamValue(k, "ACTIONTYPE", "ServerValidateOnBlur");
	k = replaceUrlParamValue(k, "INPUTBOX_VALUE", g);
	k = replaceUrlParamValue(k, "PAGEID", i.pageid);
	k = replaceUrlParamValue(k, "REPORTID", i.reportid);
	var e = "";
	if (b != null) {
		for ( var h in b) {
			if (b[h] == null) {
				continue
			}
			e += h + SAVING_NAMEVALUE_SEPERATOR + b[h]
					+ SAVING_COLDATA_SEPERATOR
		}
		if (e.lastIndexOf(SAVING_COLDATA_SEPERATOR) == e.length
				- SAVING_COLDATA_SEPERATOR.length) {
			e = e.substring(0, e.length - SAVING_COLDATA_SEPERATOR.length)
		}
	}
	k = replaceUrlParamValue(k, "OTHER_VALUES", e);
	var a = k.substring(k.indexOf("?") + 1);
	k = k.substring(0, k.indexOf("?"));
	var b = new Object();
	b.inputboxid = d;
	b.parentElementObj = j;
	b.inputboxvalue = g;
	b.metadataObj = i;
	b.serverValidateCallbackMethod = f;
	XMLHttpREPORT.sendReq("POST", k, a, onSuccessServerValidate,
			onFailedServerValidate, b)
}
function onSuccessServerValidate(f, a) {
	var g = f.responseText;
	var e = new Object();
	var d = parseTagContent(g, "<WX-SUCCESS-FLAG>", "</WX-SUCCESS-FLAG>");
	e.isSuccess = d != null && d[0] == "true";
	d = parseTagContent(g, "<WX-ERROR-MESSAGE>", "</WX-ERROR-MESSAGE>");
	e.errormess = d == null || d.length == 0 ? "" : d[0];
	d = parseTagContent(g, "<WX-SERVER-DATA>", "</WX-SERVER-DATA>");
	e.serverDataObj = d == null || d.length == 0 ? null
			: getObjectByJsonString(d[0]);
	e.validatetype = "onblur";
	e.inputboxid = a.inputboxid;
	e.parentElementObj = a.parentElementObj;
	e.metadataObj = a.metadataObj;
	e.value = a.inputboxvalue;
	if (!e.isSuccess && e.errormess != null && e.errormess != "") {
		var c = null;
		d = parseTagContent(g, "<WX-ERRORPROMPT-PARAMS>",
				"</WX-ERRORPROMPT-PARAMS>");
		if (d != null && d.length == 2) {
			c = getObjectByJsonString(d[0])
		}
		if (c == null) {
			var b = getInputboxMetadataObj(e.inputboxid);
			if (b != null) {
				c = getObjectByJsonString(b
						.getAttribute("errorpromptparamsonblur"))
			}
		}
		wx_serverPromptErrorOnblur(e.metadataObj, e.parentElementObj,
				e.errormess, c)
	} else {
		if (e.isSuccess) {
			wx_hideServerPromptErrorOnblur(e.metadataObj, e.parentElementObj)
		}
	}
	if (a.serverValidateCallbackMethod != null) {
		a.serverValidateCallbackMethod(e)
	}
}
function onFailedServerValidate() {
	wx_warn("\u8fdb\u884c\u670d\u52a1\u5668\u7aef\u6821\u9a8c\u5931\u8d25")
}
function getChangeStyleObjByParentElementOnEdit(a) {
	if (a.changeStyleObjByInputBoxObjOnEdit != null) {
		return a.changeStyleObjByInputBoxObjOnEdit
	}
	var c = getInputboxIdByParentElementObj(a);
	if (c == null || c == "") {
		return null
	}
	if (c.indexOf("_wxcol_") > 0) {
		var b = getReportMetadataObj(getReportGuidByInputboxId(c));
		if (b == null) {
			return null
		}
		if (b.reportfamily == ReportFamily.EDITABLELIST2
				|| b.reportfamily == ReportFamily.EDITABLEDETAIL2) {
			return a
		}
	}
	var d = getWXInputBoxChildNode(a);
	if (d == null) {
		d = getInputBoxChildNode(a)
	}
	d = getChangeStyleObjByInputBoxObjOnEdit(d);
	if (d == null) {
		d = a
	}
	return d
}
function invokeServerActionForReportDataImpl(l, k, p, d, x, m, v, a) {
	var h = getComponentGuidById(l, k);
	var q = getReportMetadataObj(h);
	if (q == null) {
		return
	}
	if (v == "") {
		v = null
	}
	if (v != null && typeof v != "function") {
		wx_warn("\u4f20\u5165\u7684beforeCallbackMethod\u53c2\u6570\u4e0d\u662f\u51fd\u6570\u5bf9\u8c61");
		return
	}
	if (a == "") {
		a = null
	}
	if (a != null && typeof a != "function") {
		wx_warn("\u4f20\u5165\u7684afterCallbackMethod\u53c2\u6570\u4e0d\u662f\u51fd\u6570\u5bf9\u8c61");
		return
	}
	var s = null;
	if (p.indexOf("button{") == 0) {
		s = d
	} else {
		if (p.indexOf("button_autoreportdata{") == 0) {
			var o = p.indexOf("button_autoreportdata{");
			p = p.substring(0, o) + "button{"
					+ p.substring(o + "button_autoreportdata{".length)
		}
		s = new Array();
		var j = convertToArray(getEditableReportColValues(l, k, null, d));
		if (j != null && j.length > 0) {
			var f = null;
			var c = null;
			for (var r = 0, u = j.length; r < u; r++) {
				f = new Object();
				var t = false;
				for ( var w in j[r]) {
					c = j[r][w];
					if (c == null || c.name == null || c.name == "") {
						continue
					}
					t = true;
					if (c.value == null) {
						j[r].value = ""
					}
					f[c.name] = c.value;
					if (c.oldname == null || c.oldname == ""
							|| c.oldname == c.name) {
						continue
					}
					if (c.oldvalue == null) {
						c.oldvalue = ""
					}
					f[c.oldname] = c.oldvalue
				}
				if (t) {
					s[s.length] = f
				}
			}
		}
		if (s.length == 0) {
			wx_warn("\u6ca1\u6709\u53d6\u5230\u8981\u64cd\u4f5c\u7684\u62a5\u8868\u6570\u636e\uff01");
			return
		}
	}
	if (v != null) {
		if (s == null) {
			s = new Array()
		}
		if (x == null) {
			x = new Object()
		}
		var g = v(s, x);
		if (g !== true) {
			return
		}
	}
	var n = null;
	if (a != null) {
		n = h
	}
	var b = assempleServerActionDataParams(n, s);
	var e = getComponentUrl(q.pageid, q.refreshComponentGuid, q.slave_reportid);
	if (m) {
		e = removeReportNavigateInfosFromUrl(e, q, null);
		e = e + "&WX_SERVERACTION_SHOULDREFRESH=true"
	}
	if (b != null && b != "") {
		e = e + "&WX_SERVERACTION_PARAMS=" + b
	}
	b = getCustomizedParamsObjAsString(x);
	if (b != null && b != "") {
		e = e + "&WX_SERVERACTION_CUSTOMIZEDPARAMS=" + b
	}
	if (a != null) {
		e = e + "&WX_SERVERACTION_CALLBACKMETHOD="
				+ getFunctionNameByFunctionObj(a)
	}
	e = e + "&WX_SERVERACTION_COMPONENTID=" + k;
	e = e + "&WX_SERVERACTION_SERVERCLASS=" + p;
	refreshComponent(e)
}
function getCustomizedParamsObjAsString(c) {
	if (c == null || c == "") {
		return ""
	}
	var b = "";
	for ( var a in c) {
		if (c[a] == null || c[a] == "") {
			continue
		}
		b += a + SAVING_NAMEVALUE_SEPERATOR + encodeURIComponent(c[a])
				+ SAVING_COLDATA_SEPERATOR
	}
	if (b.lastIndexOf(SAVING_COLDATA_SEPERATOR) == b.length
			- SAVING_COLDATA_SEPERATOR.length) {
		b = b.substring(0, b.length - SAVING_COLDATA_SEPERATOR.length)
	}
	return b
}
function invokeServerActionForComponentImpl(c, i, d, g, b, f) {
	if (f != null && typeof f != "function") {
		wx_warn("\u4f20\u5165\u7684\u56de\u8c03\u51fd\u6570\u4e0d\u662f\u51fd\u6570\u5bf9\u8c61");
		return
	}
	var k = getComponentGuidById(c, i);
	var e = getComponentMetadataObj(k);
	if (e == null) {
		return
	}
	var a = getComponentUrl(c, e.refreshComponentGuid, e.metaDataSpanObj
			.getAttribute("slave_reportid"));
	if (a == null || a == "") {
		return
	}
	if (b) {
		a = resetComponentUrl(c, i, a, "navigate.false");
		a = a + "&WX_SERVERACTION_SHOULDREFRESH=true"
	}
	if (i == null || i == "") {
		i = c
	}
	a = a + "&WX_SERVERACTION_COMPONENTID=" + i;
	var h = null;
	if (f != null) {
		a = a + "&WX_SERVERACTION_CALLBACKMETHOD="
				+ getFunctionNameByFunctionObj(f);
		h = k
	}
	var j = assempleServerActionDataParams(h, g);
	if (j != null && j != "") {
		a = a + "&WX_SERVERACTION_PARAMS=" + j
	}
	a = a + "&WX_SERVERACTION_SERVERCLASS=" + d;
	refreshComponent(a)
}
function getFunctionNameByFunctionObj(b) {
	if (b == null || typeof b != "function") {
		return ""
	}
	var c = wx_trim(b.toString());
	var a = c.indexOf("function");
	if (a < 0) {
		return ""
	}
	c = c.substring(a + "function".length);
	c = c.substring(0, c.indexOf("("));
	return wx_trim(c)
}
function invokeServerActionImpl(g, a, c, f) {
	if (c != null && typeof c != "function") {
		wx_warn("\u4f20\u5165\u7684\u56de\u8c03\u51fd\u6570\u4e0d\u662f\u51fd\u6570\u5bf9\u8c61");
		return
	}
	if (f != null && typeof f != "function") {
		wx_warn("\u4f20\u5165\u7684\u51fa\u9519\u5904\u7406\u51fd\u6570\u4e0d\u662f\u51fd\u6570\u5bf9\u8c61");
		return
	}
	var b = WXConfig.showreport_url;
	var d = "?";
	if (b.indexOf("?") > 0) {
		d = "&"
	}
	b = b + d + "ACTIONTYPE=invokeServerAction";
	var h = assempleServerActionDataParams(null, a);
	if (h != null && h != "") {
		b = b + "&WX_SERVERACTION_PARAMS=" + h
	}
	b = b + "&WX_SERVERACTION_SERVERCLASS=" + g;
	var e = b.substring(b.indexOf("?") + 1);
	b = b.substring(0, b.indexOf("?"));
	XMLHttpREPORT.sendReq("POST", b, e, c, f, a)
}
function assempleServerActionDataParams(e, b) {
	if (b == null || b == "") {
		return ""
	}
	var f = convertToArray(b);
	var g = "";
	for (var d = 0, a = f.length; d < a; d++) {
		var h = "";
		for ( var c in f[d]) {
			if (c == null || c == "") {
				continue
			}
			if (f[d][c] == null) {
				f[d][c] = ""
			}
			h = h + c + SAVING_NAMEVALUE_SEPERATOR
					+ encodeURIComponent(f[d][c]) + SAVING_COLDATA_SEPERATOR
		}
		if (h.lastIndexOf(SAVING_COLDATA_SEPERATOR) == h.length
				- SAVING_COLDATA_SEPERATOR.length) {
			h = h.substring(0, h.length - SAVING_COLDATA_SEPERATOR.length)
		}
		if (h == "") {
			continue
		}
		g = g + h + SAVING_ROWDATA_SEPERATOR
	}
	if (g.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == g.length
			- SAVING_ROWDATA_SEPERATOR.length) {
		g = g.substring(0, g.length - SAVING_ROWDATA_SEPERATOR.length)
	}
	if (g == "") {
		return ""
	}
	if (e != null && e != "") {
		if (WX_ALL_SAVEING_DATA == null) {
			WX_ALL_SAVEING_DATA = new Object()
		}
		WX_ALL_SAVEING_DATA[e] = f
	}
	return g
}
function fixedRowColTable(a) {
	new fixedRowColTableObj(a)
}
var WX_M_FIXEDCOLSWIDTH;
function fixedRowColTableObj(E) {
	var m = E.pageid;
	var l = E.reportid;
	var e = getComponentGuidById(m, l);
	var o = getReportMetadataObj(e);
	var a = o.metaDataSpanObj.getAttribute("ft_fixedRowsCount");
	var D = o.metaDataSpanObj.getAttribute("ft_fixedColids");
	var d = o.metaDataSpanObj.getAttribute("ft_totalColCount");
	if ((a == null || a == "") && (D == null || D == "")) {
		return
	}
	if (d == null || d == "") {
		return
	}
	this.fixedRowsCount = parseInt(a);
	if (D != null && D != "") {
		var u = new Array();
		var r = D.split(";");
		for (var z = 0, A = r.length; z < A; z++) {
			if (r[z] == null || r[z] == "") {
				continue
			}
			u[u.length] = r[z]
		}
		this.fixedColidsArr = u;
		this.fixedColsCount = u.length
	} else {
		this.fixedColsCount = 0;
		this.fixedColidsArr = null
	}
	this.colcnt = parseInt(d);
	if (this.fixedRowsCount < 0) {
		this.fixedRowsCount = 0
	}
	if (this.fixedColsCount < 0) {
		this.fixedColsCount = 0
	}
	if (this.colcnt <= 0) {
		return
	}
	this.tableObj = document.getElementById(e + "_data");
	var b = this.tableObj.tBodies[0].rows;
	if (b == null || b.length <= 0) {
		return
	}
	if (this.fixedRowsCount > b.length) {
		this.fixedRowsCount = b.length
	}
	this.divContainerObj = document.createElement("DIV");
	this.divFixedHeaderObj = this.divContainerObj.cloneNode(false);
	this.divHeaderObj = this.divContainerObj.cloneNode(false);
	this.divHeaderInnerObj = this.divContainerObj.cloneNode(false);
	this.divFixedDataObj = this.divContainerObj.cloneNode(false);
	this.divFixedDataInnerObj = this.divContainerObj.cloneNode(false);
	this.divDataObj = this.divContainerObj.cloneNode(false);
	this.colGroupObj = document.createElement("COLGROUP");
	this.tableObj.style.margin = "0px";
	if (this.tableObj.getElementsByTagName("COLGROUP").length > 0) {
		this.tableObj.removeChild(this.tableObj
				.getElementsByTagName("COLGROUP")[0])
	}
	this.parentDivObj = this.tableObj.parentNode;
	this.tableParentDivHeight = this.parentDivObj.offsetHeight;
	this.tableParentDivWidth = this.parentDivObj.offsetWidth;
	if (this.parentDivObj.style.height == null
			|| this.parentDivObj.style.height == "") {
		this.parentDivObj.style.height = this.tableParentDivHeight + "px"
	}
	this.divContainerObj.className = "cls-fixed-divcontainer";
	this.divFixedHeaderObj.className = "cls-fixed-fixedHeader";
	this.divHeaderObj.className = "cls-fixed-header";
	this.divHeaderInnerObj.className = "cls-fixed-headerInner";
	this.divFixedDataObj.className = "cls-fixed-fixeddata";
	this.divFixedDataInnerObj.className = "cls-fixed-fixeddataInner";
	this.divDataObj.className = "cls-fixed-data";
	this.divDataObj.id = e + "_fixeddata";
	var c, C;
	this.headerTableObj = this.tableObj.cloneNode(false);
	if (this.tableObj.tHead) {
		c = this.tableObj.tHead;
		this.headerTableObj.appendChild(c.cloneNode(false));
		C = this.headerTableObj.tHead
	} else {
		c = this.tableObj.tBodies[0];
		this.headerTableObj.appendChild(c.cloneNode(false));
		C = this.headerTableObj.tBodies[0]
	}
	c = c.rows;
	for (var z = 0; z < this.fixedRowsCount; z++) {
		C.appendChild(c[z].cloneNode(true))
	}
	this.divHeaderInnerObj.appendChild(this.headerTableObj);
	if (this.fixedColsCount > 0) {
		this.fixedHeaderTableObj = this.headerTableObj.cloneNode(true);
		this.divFixedHeaderObj.appendChild(this.fixedHeaderTableObj);
		this.sFDataTable = this.tableObj.cloneNode(true);
		this.divFixedDataInnerObj.appendChild(this.sFDataTable)
	}
	var p = getValidRowidx(b, this.colcnt);
	var y = 0;
	for (var z = 0, A = p.cells.length; z < A; z++) {
		var g = p.cells[z].colSpan;
		var B = p.cells[z].style.display == "none";
		var v = p.cells[z].offsetWidth;
		if (g > 1) {
			if (!B) {
				v = v / g
			}
		} else {
			g = 1
		}
		for (var w = 0; w < g; w++) {
			var t = document.createElement("COL");
			if (B) {
				if (!isIE) {
					this.colGroupObj.appendChild(t);
					this.colGroupObj.lastChild.style.display = "none"
				}
			} else {
				this.colGroupObj.appendChild(t);
				if (y < this.fixedColsCount) {
					if (WX_M_FIXEDCOLSWIDTH == null) {
						WX_M_FIXEDCOLSWIDTH = new Object()
					}
					var n = WX_M_FIXEDCOLSWIDTH[e + this.fixedColidsArr[y]];
					if (n == null || n == "") {
						WX_M_FIXEDCOLSWIDTH[e + this.fixedColidsArr[y]] = v;
						n = v
					}
					this.colGroupObj.lastChild.setAttribute("width", n)
				} else {
					this.colGroupObj.lastChild.setAttribute("width", v)
				}
				y++
			}
		}
	}
	this.tableObj.insertBefore(this.colGroupObj.cloneNode(true),
			this.tableObj.firstChild);
	this.headerTableObj.insertBefore(this.colGroupObj.cloneNode(true),
			this.headerTableObj.firstChild);
	if (this.fixedColsCount > 0) {
		this.sFDataTable.insertBefore(this.colGroupObj.cloneNode(true),
				this.sFDataTable.firstChild);
		this.fixedHeaderTableObj.insertBefore(this.colGroupObj.cloneNode(true),
				this.fixedHeaderTableObj.firstChild)
	}
	if (this.fixedColsCount > 0) {
		this.sFDataTable.className += " cls-fixed-cols"
	}
	if (this.fixedColsCount > 0) {
		this.divContainerObj.appendChild(this.divFixedHeaderObj)
	}
	this.divHeaderObj.appendChild(this.divHeaderInnerObj);
	this.divContainerObj.appendChild(this.divHeaderObj);
	if (this.fixedColsCount > 0) {
		this.divFixedDataObj.appendChild(this.divFixedDataInnerObj);
		this.divContainerObj.appendChild(this.divFixedDataObj)
	}
	this.divContainerObj.appendChild(this.divDataObj);
	this.parentDivObj.insertBefore(this.divContainerObj, this.tableObj);
	this.divDataObj.appendChild(this.tableObj);
	var q, s;
	this.sHeaderHeight = this.tableObj.tBodies[0].rows[(this.tableObj.tHead) ? 0
			: this.fixedRowsCount].offsetTop;
	s = "margin-top: " + (this.sHeaderHeight * -1) + "px;";
	q = "margin-top: " + this.sHeaderHeight + "px;";
	q += "height: " + (this.tableParentDivHeight - this.sHeaderHeight) + "px;";
	if (this.fixedColsCount > 0) {
		var f = null;
		for (var z = 0, A = b.length; z < A; z++) {
			for (var x = 0, h = b[z].cells.length; x < h; x++) {
				if (b[z].cells[x].getAttribute("first_nonfixed_col") == "true") {
					f = b[z].cells[x];
					break
				}
			}
			if (f != null) {
				break
			}
		}
		this.sFHeaderWidth = -1;
		if (f != null) {
			this.sFHeaderWidth = f.offsetLeft
		}
		if (window.getComputedStyle) {
			c = document.defaultView;
			C = this.tableObj.tBodies[0].rows[0].cells[0];
			if (navigator.taintEnabled) {
				this.sFHeaderWidth += Math.ceil(parseInt(c.getComputedStyle(C,
						null).getPropertyValue("border-right-width")) / 2)
			} else {
				this.sFHeaderWidth += parseInt(c.getComputedStyle(C, null)
						.getPropertyValue("border-right-width"))
			}
		} else {
			if (isIE) {
				c = this.tableObj.tBodies[0].rows[0].cells[0];
				C = [ c.currentStyle.borderRightWidth,
						c.currentStyle.borderLeftWidth ];
				if (/px/i.test(C[0]) && /px/i.test(C[1])) {
					C = [ parseInt(C[0]), parseInt(C[1]) ].sort();
					this.sFHeaderWidth += Math.ceil(parseInt(C[1]) / 2)
				}
			}
		}
		if (window.opera) {
			this.divFixedDataObj.style.height = this.tableParentDivHeight
					+ "px"
		}
		if (this.sFHeaderWidth >= 0) {
			this.divFixedHeaderObj.style.width = this.sFHeaderWidth + "px";
			s += "margin-left: " + (this.sFHeaderWidth * -1) + "px;";
			q += "margin-left: " + this.sFHeaderWidth + "px;";
			q += "width: " + (this.tableParentDivWidth - this.sFHeaderWidth)
					+ "px;"
		}
	} else {
		q += "width: " + this.tableParentDivWidth + "px;"
	}
	this.divDataObj.style.cssText = q;
	this.tableObj.style.cssText = s;
	(function(i) {
		if (i.fixedColsCount > 0) {
			i.divDataObj.onscroll = function() {
				i.divHeaderInnerObj.style.right = i.divDataObj.scrollLeft
						+ "px";
				i.divFixedDataInnerObj.style.top = (i.divDataObj.scrollTop * -1)
						+ "px"
			}
		} else {
			i.divDataObj.onscroll = function() {
				i.divHeaderInnerObj.style.right = i.divDataObj.scrollLeft
						+ "px"
			}
		}
		if (isIE) {
			window.attachEvent("onunload", function() {
				i.divDataObj.onscroll = null;
				i = null
			})
		}
	})(this)
}
function getValidRowidx(g, c) {
	var a = -1;
	var h;
	for (var f = 0, k = g.length; f < k; f++) {
		h = g[f];
		if (a < 0 || h.cells.length > g[a].cells.length) {
			a = f
		}
		var l = 1;
		var b = false;
		for (var e = 0, d = h.cells.length; e < d; e++) {
			if (h.cells[e].rowSpan > l) {
				l = h.cells[e].rowSpan
			}
			if (b) {
				continue
			}
			if (h.cells[e].colSpan > 1) {
				b = true
			}
		}
		if (!b && c == h.cells.length) {
			return h
		}
		f += l - 1
	}
	return g[a]
}
function getParentFixedDataObj(b, a) {
	while (true) {
		if (a == null) {
			return null
		}
		if (a.getAttribute("id") == "WX_CONTENT_" + b) {
			return null
		}
		if (a.className == "cls-fixed-divcontainer") {
			return document.getElementById(b + "_fixeddata")
		}
		a = a.parentNode
	}
}
function shiftTabPanelItemAsyn(a, c, e, f, d) {
	var b = getComponentUrl(a, e, null);
	b = replaceUrlParamValue(b, c + "_selectedIndex", f);
	if (d != null && d != "") {
		b = d(a, c, b);
		if (b == null || b == "") {
			return
		}
	}
	refreshComponent(b, null, {
		keepSelectedRowsAction : true,
		keepSavingRowsAction : true
	})
}
function shiftTabPanelItemSyn(g, f, k, j) {
	var b = getComponentGuidById(g, f);
	var h = document.getElementById(b + "_" + j + "_title");
	var i = getParentElementObj(h, "TABLE");
	var m = i.getAttribute("selectedItemIndex");
	if (m == null || m == "") {
		m = "0"
	}
	if (j == m) {
		return
	}
	var l = document.getElementById(b + "_" + m + "_content");
	l.style.display = "none";
	var a = document.getElementById(b + "_" + j + "_content");
	a.style.display = "";
	var n = document.getElementById(b + "_" + m + "_title");
	var h = document.getElementById(b + "_" + j + "_title");
	var e = n.className;
	n.className = h.className;
	h.className = e;
	var o = h.getAttribute("tabitem_position_type");
	var p = n.getAttribute("tabitem_position_type");
	if (o == "first" || o == "middle" || o == "last") {
		changeImgForTabItemTitle(b, j, m, o, p)
	}
	i.setAttribute("selectedItemIndex", j);
	var d = getComponentUrl(g, k, null);
	d = replaceUrlParamValue(d, f + "_selectedIndex", j);
	var c = document.getElementById(g + "_url_id");
	c.setAttribute("value", d)
}
function changeImgForTabItemTitle(a, g, f, l, m) {
	var j = document;
	var d = j.getElementById(a + "_" + f + "_rightimg");
	var h = j.getElementById(a + "_" + g + "_rightimg");
	var k = d.src;
	var i = k.lastIndexOf("/");
	var e = k.substring(0, i) + "/";
	var c = parseInt(g, 10);
	var b = parseInt(f, 10);
	if (c - b == 1) {
		d.src = e + "title2_deselected_selected.gif";
		if (m != "first") {
			j.getElementById(a + "_" + (b - 1) + "_rightimg").src = e
					+ "title2_deselected_deselected.gif"
		}
		if (l == "last") {
			h.src = e + "title2_selected.gif"
		} else {
			h.src = e + "title2_selected_deselected.gif"
		}
	} else {
		if (b - c == 1) {
			h.src = e + "title2_selected_deselected.gif";
			if (l != "first") {
				j.getElementById(a + "_" + (c - 1) + "_rightimg").src = e
						+ "title2_deselected_selected.gif"
			}
			if (m == "last") {
				d.src = e + "title2_deselected.gif"
			} else {
				d.src = e + "title2_deselected_deselected.gif"
			}
		} else {
			if (m == "first") {
				d.src = e + "title2_deselected_deselected.gif"
			} else {
				if (m == "middle") {
					d.src = e + "title2_deselected_deselected.gif";
					j.getElementById(a + "_" + (b - 1) + "_rightimg").src = e
							+ "title2_deselected_deselected.gif"
				} else {
					if (m == "last") {
						d.src = e + "title2_deselected.gif";
						j.getElementById(a + "_" + (b - 1) + "_rightimg").src = e
								+ "title2_deselected_deselected.gif"
					}
				}
			}
			if (l == "first") {
				h.src = e + "title2_selected_deselected.gif"
			} else {
				if (l == "middle") {
					h.src = e + "title2_selected_deselected.gif";
					j.getElementById(a + "_" + (c - 1) + "_rightimg").src = e
							+ "title2_deselected_selected.gif"
				} else {
					if (l == "last") {
						h.src = e + "title2_selected.gif";
						j.getElementById(a + "_" + (c - 1) + "_rightimg").src = e
								+ "title2_deselected_selected.gif"
					}
				}
			}
		}
	}
}
function adjustTabItemTitleImgHeight(d) {
	if (d == null || d.tabpanelguid == null || d.tabpanelguid == ""
			|| d.tabitemcount == null) {
		return
	}
	var c = document;
	var b;
	for (var a = 0; a < d.tabitemcount; a++) {
		b = c.getElementById(d.tabpanelguid + "_" + a + "_rightimg");
		if (b != null) {
			b.style.height = b.parentNode.clientHeight + "px"
		}
	}
}
var LODOP_OBJ;
function printComponentsData(d, k, l, f) {
	if (l == null || l == "") {
		return
	}
	var h = parseStringToArray(l, ";", false);
	if (h == null || h.length == 0) {
		return
	}
	var c = "";
	if (h.length == 1) {
		var o = getComponentGuidById(d, h[0]);
		var n = getReportMetadataObj(o);
		if (n == null) {
			c = getComponentUrl(d, null, null)
		} else {
			c = getComponentUrl(d, n.refreshComponentGuid, n.slave_reportid)
		}
	} else {
		c = getComponentUrl(d, null, null);
		var m = null;
		for (var g = 0, j = h.length; g < j; g++) {
			m = getReportMetadataObj(getComponentGuidById(d, h[g]));
			if (m == null) {
				continue
			}
			if (m.slave_reportid == h[g]) {
				var b = getComponentUrl(d, null, h[g]);
				c = mergeUrlParams(c, b, false);
				c = replaceUrlParamValue(c, "SLAVE_REPORTID", null)
			}
		}
	}
	c = replaceUrlParamValue(c, "COMPONENTIDS", k);
	c = replaceUrlParamValue(c, "INCLUDE_APPLICATIONIDS", l);
	c = replaceUrlParamValue(c, "DISPLAY_TYPE", "6");
	c = replaceUrlParamValue(c, "WX_ISAJAXLOAD", "true");
	var e = c.substring(c.indexOf("?") + 1);
	c = c.substring(0, c.indexOf("?"));
	var a = new Object();
	a.pageid = d;
	a.printtype = f;
	XMLHttpREPORT.sendReq("POST", c, e, printCallBack, onPrintErrorMethod, a)
}
function printCallBack(k, a) {
	var h = k.responseText;
	var b = a.pageid;
	var d = a.printtype;
	var f = h.indexOf("<RESULTS_INFO-" + b + ">");
	var e = h.indexOf("</RESULTS_INFO-" + b + ">");
	var i = null;
	if (f >= 0 && e >= 0 && e > f) {
		i = h.substring(f + ("<RESULTS_INFO-" + b + ">").length, e);
		h = h.substring(0, f)
				+ h.substring(e + ("</RESULTS_INFO-" + b + ">").length)
	}
	var g = getObjectByJsonString(i);
	var j = g.onloadMethods;
	if (j && j != "") {
		var c = "";
		f = h.indexOf("<print-jobname-" + b + ">");
		e = h.indexOf("</print-jobname-" + b + ">");
		if (f >= 0 && e > f) {
			c = h.substring(f + ("<print-jobname-" + b + ">").length, e);
			h = h.substring(0, f)
					+ h.substring(e + ("</print-jobname-" + b + ">").length)
		}
		j[0].methodname(c, h, d)
	}
}
function onPrintErrorMethod(a) {
	wx_error("\u6253\u5370\u5931\u8d25")
}
function getAdvancedPrintRealValue(b, e) {
	if (b == null || b == "" || e == null || e == "") {
		return ""
	}
	var d = "<" + e + ">";
	var c = "</" + e + ">";
	var a = b.indexOf(d);
	if (a < 0) {
		return ""
	}
	b = b.substring(a + d.length);
	a = b.indexOf(c);
	if (a < 0) {
		return b
	}
	return b.substring(0, a)
}
function getAdvancedPrintRealValueForPage(b, f, e) {
	if (b == null || b == "" || f == null || f == "") {
		return ""
	}
	var d = "<" + f + ">";
	var c = "</" + f + ">";
	var a = b.indexOf(d);
	if (a < 0) {
		return ""
	}
	b = b.substring(a + d.length);
	a = b.indexOf(c);
	if (a >= 0) {
		b = b.substring(0, a)
	}
	if (e == null || e == "") {
		return b
	}
	d = "<" + e + ">";
	c = "</" + e + ">";
	a = b.indexOf(d);
	if (a < 0) {
		return ""
	}
	b = b.substring(a + d.length);
	a = b.indexOf(c);
	if (a < 0) {
		return b
	}
	return b.substring(0, a)
}
function getPrintPageCount(b, e) {
	if (b == null || b == "" || e == null || e == "") {
		return 0
	}
	var d = "<" + e + "_pagecount>";
	var c = "</" + e + "_pagecount>";
	var a = b.indexOf(d);
	if (a < 0) {
		return 0
	}
	b = b.substring(a + d.length);
	a = b.indexOf(c);
	if (a < 0) {
		return 0
	}
	return parseInt(b.substring(0, a), 10)
}
function wx_sendRedirect(a) {
	if (a == null || a.url == null || a.url == "") {
		return
	}
	window.location.href = a.url
}
function doFileUploadAction() {
	displayLoadingMessage();
	return true
}
function displayFusionChartsData(g) {
	var f = g.pageid + g.reportid + parseInt(Math.random() * 10000000);
	var e = new FusionCharts(g.swfileurl, f, g.width, g.height, g.debugMode,
			g.registerWithJS);
	if (g.datatype == "xml") {
		e.setXMLData(paramdecode(g.data))
	} else {
		if (g.datatype == "xmlurl") {
			e.setXMLUrl(WXConfig.webroot + "wxtmpfiles/chartdata/" + g.data)
		} else {
			var a = WXConfig.showreport_url;
			var d = a.indexOf("?") > 0 ? "&" : "?";
			a = a + d + "ACTIONTYPE=loadChartXmlFile&xmlfilename=" + g.data;
			e.setXMLUrl(a)
		}
	}
	e.render(getComponentGuidById(g.pageid, g.reportid) + "_data");
	var c = g.chartOnloadMethods;
	g.chartOnloadMethods = null;
	g.chartid = f;
	g.chartObj = e;
	if (c != null && c.length > 0) {
		for (var b = 0; b < c.length; b++) {
			g.customizeData = c[b].methodparams;
			c[b].method(g)
		}
	}
}
var WX_ISSYSTEM_LOADED = true;
