var WX_SAVE_IGNORE = 0;
var WX_SAVE_TERMINAT = -1;
var WX_SAVE_CONTINUE = 1;
var WX_CUSTOMIZE_DATAS;
function initInputBoxData(a, c) {
	var b = {
		me : a,
		parentTdObj : c
	};
	return b
}
function fillInputBoxOnClick(a) {
	var c = a || window.event;
	if (c.ctrlKey || c.shiftKey) {
		return false
	}
	var b = c.srcElement || c.target;
	if (b.tagName != "TD") {
		if (isWXInputBoxNode(b)) {
			return false
		}
		b = getParentElementObj(b, "TD");
		if (b == null) {
			return false
		}
	}
	if (getWXInputBoxChildNode(b) != null) {
		return false
	}
	fillInputBoxToTd(b)
}
function resetChildSelectBoxData(h) {
	var e = h.getAttribute("id");
	if (e == null || e == "") {
		return
	}
	var d = getReportGuidByInputboxId(e);
	var c = getReportMetadataObj(d);
	var f = getInputboxParentElementObjByTagName(h, "TD");
	var a = getUpdateColDestObj(f, c.reportguid, f);
	var g = a.getAttribute("oldvalue");
	var b = getInputBoxValue(h);
	if (g == null) {
		g = ""
	}
	if (b == null) {
		b = ""
	}
	resetTdValue(f, b == g)
}
function resetTdValue(e, i) {
	var k = e.getAttribute("id");
	var h = getInputboxIdByParentElementObj(e);
	if (h == null || h == "") {
		return
	}
	var b = getReportGuidByInputboxId(h);
	var m = getReportMetadataObj(b);
	var f = getInputboxMetadataObj(h);
	if (f == null) {
		return
	}
	var c = f.getAttribute("childboxids");
	if (c == null || g == "") {
		return
	}
	var o = c.split(";");
	for (var d = 0; d < o.length; d++) {
		var g = o[d];
		if (g == null || g == "") {
			continue
		}
		var j = g + "__td";
		var l = k.lastIndexOf("__td");
		if (l > 0) {
			var p = k.substring(l + 4);
			if (p != null && p != "") {
				j = j + p
			}
		}
		var a = document.getElementById(j);
		if (a != null) {
			resetChildTdValue(m, a, i)
		}
	}
}
function resetChildTdValue(c, e, b) {
	var f = getUpdateColSrcObj(e, c.reportguid, e);
	var a = getUpdateColDestObj(e, c.reportguid, e);
	var d = f.getAttribute("oldInnerHTMLValue");
	if (d == null) {
		f.setAttribute("oldInnerHTMLValue", f.innerHTML)
	}
	if (b) {
		if (d == null) {
			return
		}
		f.setAttribute("value", f.getAttribute("oldvalue"));
		f.innerHTML = d;
		a.setAttribute("value", a.getAttribute("oldvalue"))
	} else {
		f.setAttribute("value", "");
		setColDisplayValueToEditable2Td(f, "&nbsp;");
		a.setAttribute("value", "")
	}
	resetTdValue(e, b)
}
function addInputboxDataForSaving(c, d) {
	var b = getReportMetadataObj(c);
	var f = getInputboxParentElementObj(d);
	if (f == null) {
		return
	}
	var e = null;
	if (b.reportfamily == ReportFamily.EDITABLELIST2
			|| b.reportfamily == ReportFamily.EDITABLEDETAIL2) {
		e = f
	} else {
		e = getChangeStyleObjByInputBoxObjOnEdit(d)
	}
	if (e == null) {
		e = d
	}
	f = getUpdateColDestObj(f, c, f);
	var g = f.getAttribute("oldvalue");
	if (g == null) {
		g = ""
	}
	var a = wx_getColValue(f);
	if (a == null) {
		a = ""
	}
	if (a == g) {
		return
	}
	addDataForSaving(c, e)
}
function addElementDataForSaving(a, b) {
	b = getUpdateColSrcObj(b, a, b);
	addDataForSaving(a, getChangeStyleObjByParentElementOnEdit(b))
}
function addDataForSaving(c, d) {
	changeEditedInputboxDisplayStyle(d);
	var b = getReportMetadataObj(c);
	var a = null;
	if (b.reportfamily == ReportFamily.EDITABLELIST2
			|| b.reportfamily == ReportFamily.LISTFORM) {
		a = getParentElementObj(d, "TR")
	} else {
		a = "true"
	}
	doAddDataForSaving(c, a)
}
function doAddDataForSaving(a, c) {
	if (WX_UPDATE_ALLDATA == null) {
		WX_UPDATE_ALLDATA = new Object()
	}
	var d = WX_UPDATE_ALLDATA[a];
	if (d == null) {
		d = new Array();
		WX_UPDATE_ALLDATA[a] = d
	}
	var b = 0;
	for (; b < d.length; b = b + 1) {
		if (d[b] == c) {
			break
		}
	}
	if (b == d.length) {
		d[d.length] = c
	}
}
function addNewDataRow(n, h, w) {
	var G = document;
	var c = G.getElementById(h + "_data");
	if (c == null) {
		wx_warn("\u6b64\u62a5\u8868\u6240\u5728\u8868\u683c\u7684ID\u4e0d\u5408\u6cd5\uff0c\u65e0\u6cd5\u589e\u52a0\u65b0\u884c");
		return false
	}
	var x = getReportMetadataObj(h);
	var D = x.metaDataSpanObj.getAttribute("newRowCols");
	if (D == null || D == "") {
		wx_error("\u6ca1\u6709\u53d6\u5230\u62a5\u8868\u6dfb\u52a0\u8bb0\u5f55\u4fe1\u606f\uff0c\u53ef\u80fd\u6ca1\u6709\u4e3a\u6b64\u62a5\u8868\u914d\u7f6e\u6dfb\u52a0\u529f\u80fd");
		return false
	}
	var C = getObjectByJsonString(D);
	var q = C.currentRecordCount;
	var A = C.maxRecordCount;
	if (A != null && A > 0) {
		var g = c.getAttribute("wx_MyChangedRowNumInClient");
		if (g == null) {
			g = "0"
		}
		var u = parseInt(g);
		if (q + u >= A) {
			wx_warn("\u6b64\u62a5\u8868\u9650\u5236\u6700\u5927\u8bb0\u5f55\u6570\uff1a"
					+ A);
			return false
		}
	}
	var r = G.getElementById(h + "_nodata_tr");
	if (r != null) {
		r.parentNode.removeChild(r)
	}
	var v = c.rows.length;
	v = v + 1;
	var e = h + "_tr_" + v;
	var z = new Object();
	var l = G.createElement("tr");
	l.className = "cls-data-tr";
	l.setAttribute("id", e);
	l.setAttribute("EDIT_TYPE", "add");
	l.setAttribute("global_rowindex", "new_" + v);
	var k = C.cols;
	if (k == null || k.length == 0) {
		return false
	}
	var m = new Array();
	var o, d;
	var f, F, t;
	for (var y = 0; y < k.length; y = y + 1) {
		t = k[y];
		var j = G.createElement("td");
		j.appendChild(G.createTextNode(" "));
		l.appendChild(j);
		if (x.reportfamily == ReportFamily.LISTFORM) {
			j.className = "cls-data-td-listform"
		} else {
			j.className = "cls-data-td-editlist"
		}
		if (t.updatecolSrc != null && t.updatecolSrc != "") {
			j.setAttribute("updatecolSrc", t.updatecolSrc)
		}
		if (t.updatecolDest != null && t.updatecolDest != "") {
			j.setAttribute("updatecolDest", t.updatecolDest)
		}
		if (t.hidden == "true") {
			j.style.display = "none"
		}
		if (t.colWrapStart != null && t.colWrapStart != ""
				&& t.colWrapEnd != null && t.colWrapEnd != "") {
			j.innerHTML = t.colWrapStart + t.colWrapEnd
		}
		if (t.coltype == "EMPTY") {
			continue
		}
		if (t.coltype == "ROWSELECTED-RADIOBOX") {
			setColDisplayValueToEditable2Td(j,
					'<input type="radio" onclick="doSelectedDataRowChkRadio(this)" name="'
							+ h + '_rowselectbox_col">');
			continue
		} else {
			if (t.coltype == "ROWSELECTED-CHECKBOX") {
				setColDisplayValueToEditable2Td(j,
						'<input type="checkbox" onclick="doSelectedDataRowChkRadio(this)" name="'
								+ h + '_rowselectbox_col">');
				continue
			}
		}
		if (t.value_name != null && t.value_name != "") {
			j.setAttribute("value_name", t.value_name)
		}
		var E = null;
		f = null;
		F = null;
		if (t.boxid != null && t.boxid != "") {
			j.setAttribute("id", t.boxid + "__td" + v);
			E = t.boxid + "__" + v;
			f = getInputboxMetadataObj(t.boxid);
			if (f != null) {
				F = f.getAttribute("displayonclick")
			}
		}
		o = "";
		d = "";
		if (w != null && w[t.value_name] != null) {
			o = jsonParamDecode(w[t.value_name]);
			d = jsonParamDecode(w[t.value_name + "$label"]);
			if (d == null) {
				d = o
			}
		} else {
			if (t.defaultvalue) {
				o = t.defaultvalue;
				d = t.defaultvaluelabel;
				if (d == null) {
					d = o
				}
			}
		}
		if (o != null && o != "") {
			j.setAttribute("value", o)
		}
		if (t.coltype == "NONE-EDITABLE" || t.hidden == "true") {
			if (d != null && d != "") {
				setColDisplayValueToEditable2Td(j, d)
			}
			continue
		}
		if (F === "true") {
			if (d != null && d != "") {
				setColDisplayValueToEditable2Td(j, d)
			}
			if (window.event) {
				j.onclick = function(i) {
					return function() {
						fillInputBoxOnClick(null)
					}
				}(E)
			} else {
				j.setAttribute("onclick", "fillInputBoxOnClick(event)")
			}
		} else {
			if (f != null
					&& (f.getAttribute("parentids") == null || f
							.getAttribute("parentids") == "")) {
				addRefreshedChildBoxIds(z, f.getAttribute("childboxids"), v)
			}
			if (f.getAttribute("selectboxtype") == "combox") {
				j.setAttribute("wx_tmp_selectboxtype", "combox")
			}
			m[m.length] = j
		}
		j = null
	}
	if (c.rows.length == 0) {
		if (c.childNodes.length == 0) {
			c.appendChild(l)
		} else {
			c.childNodes[0].appendChild(l)
		}
	} else {
		if (x.metaDataSpanObj.getAttribute("addposition") !== "top") {
			c.rows[0].parentNode.appendChild(l)
		} else {
			var p = null;
			var s;
			for (var y = 0; y < c.rows.length; y++) {
				s = c.rows[y].className;
				if (s != null && s.indexOf("cls-data-tr") == 0
						&& s != "cls-data-tr-head-list") {
					p = c.rows[y];
					break
				}
			}
			if (p == null) {
				c.rows[0].parentNode.appendChild(l)
			} else {
				p.parentNode.insertBefore(l, p)
			}
		}
	}
	for (var y = 0, B = m.length; y < B; y++) {
		if (m[y].getAttribute("wx_tmp_selectboxtype") !== "combox") {
			fillInputBoxToTd(m[y])
		}
	}
	for (var y = 0, B = m.length; y < B; y++) {
		if (m[y].getAttribute("wx_tmp_selectboxtype") === "combox") {
			fillInputBoxToTd(m[y]);
			m[y].removeAttribute("wx_tmp_selectboxtype")
		}
	}
	doAddDataForSaving(h, l);
	refreshAllChildSelectboxs(z, true);
	if (A != null && A > 0) {
		setListReportChangedRowNumInClient(h, 1, true)
	}
	var a = x.metaDataSpanObj.getAttribute("addCallbackMethod");
	var b = getObjectByJsonString(a);
	if (b != null && b.method != null) {
		b.method(l)
	}
	G = null;
	c = null;
	l = null;
	x = null
}
function setListReportChangedRowNumInClient(d, b, a) {
	var f = document.getElementById(d + "_data");
	var e = f.getAttribute("wx_MyChangedRowNumInClient");
	if (e == null || e == "") {
		if (!a) {
			return
		}
		e = "0"
	}
	var c = parseInt(e) + b;
	if (c < 0) {
		c = 0
	}
	f.setAttribute("wx_MyChangedRowNumInClient", c)
}
function onKeyEvent(c) {
	var a = -1;
	var b;
	if (window.event) {
		a = window.event.keyCode;
		b = window.event.srcElement
	} else {
		a = c.which;
		b = c.target
	}
	if (a == 13) {
		b.blur();
		return false
	}
	return true
}
function setTextAreaBoxPosition(b, a) {
	var d = 0;
	var c = 0;
	if (!a) {
		return
	}
	var e = getElementAbsolutePosition(a);
	b.style.left = e.left + "px";
	b.style.top = e.top + "px";
	b.style.display = "block";
	if (!e.width || e.width < 100) {
		b.style.width = "200px"
	} else {
		b.style.width = e.width + "px"
	}
}
function getEditableListReportColValues(b, a, c, h) {
	var g = getAllEditableList2DataTrObjs(a, h);
	if (g == null || g.length == 0) {
		return null
	}
	var j = new Array();
	for (var e = 0, f = g.length; e < f; e = e + 1) {
		var d = wx_getAllColValueByParentElementObjs(g[e]
				.getElementsByTagName("TD"), c);
		if (d != null) {
			j[j.length] = d
		}
	}
	return j
}
function setEditableListReportColValue(b, c, e) {
	if (c == null || isEmptyMap(c)) {
		return false
	}
	var f = getAllEditableList2DataTrObjs(b, e);
	if (f == null || f.length == 0) {
		return false
	}
	for (var d = 0, a = f.length; d < a; d = d + 1) {
		setBatchEditableColValues(b, f[d].getElementsByTagName("TD"), c)
	}
	return true
}
function getAllEditableList2DataTrObjs(b, k) {
	var d = document.getElementById(b + "_data");
	if (d == null || d.rows.length <= 0) {
		return null
	}
	var j = new Array();
	var e = null;
	for (var c = 0, f = d.rows.length; c < f; c = c + 1) {
		e = d.rows[c];
		if (!isEditableListReportTr(b, e)) {
			continue
		}
		j[j.length] = e
	}
	if (j.length == 0) {
		return null
	}
	if (k == null) {
		return j
	}
	var a = convertToArray(k);
	var g = null;
	if (a.length == 1 && a[0].name == "SELECTEDROW") {
		if (a[0].value == true || a[0].value == "true") {
			g = "true"
		} else {
			g = "false"
		}
	}
	var h = new Array();
	for (var c = 0, f = j.length; c < f; c = c + 1) {
		if ((g == "true" && isSelectedRow(j[c]))
				|| (g == "false" && !isSelectedRow(j[c]))
				|| isMatchAllOldValues(j[c], a)) {
			h[h.length] = j[c]
		}
	}
	return h.length == 0 ? null : h
}
function isEditableListReportTr(b, d) {
	var e = d.getAttribute("id");
	if (e == null || e.indexOf(b) < 0 || e.indexOf("_tr_") < 0) {
		return false
	}
	var a;
	for (var c = 0; c < d.cells.length; c = c + 1) {
		a = d.cells[c].getAttribute("value_name");
		if (a != null && a != "") {
			return true
		}
	}
	return false
}
function isMatchAllOldValues(k, a) {
	var m = null;
	var f = null;
	for (var e = 0, h = a.length; e < h; e = e + 1) {
		f = a[e];
		var b = f.name;
		if (b == null || b == "") {
			continue
		}
		var g = f.matchmode;
		if (g == null || g == "") {
			g = "equals"
		}
		var d = 0;
		for (var c = k.cells.length; d < c; d = d + 1) {
			m = k.cells[d];
			var l = m.getAttribute("value_name");
			if (l == null || l == "" || l != b) {
				continue
			}
			if (f.oldvalue) {
				if (!matchOldValue(f.oldvalue, m.getAttribute("oldvalue"), g)) {
					return false
				}
			}
			if (f.value) {
				if (!matchOldValue(f.value, wx_getColValue(m), g)) {
					return false
				}
			}
			break
		}
		if (d == k.cells.length) {
			return false
		}
	}
	return true
}
function matchOldValue(a, c, b) {
	if (a == null) {
		a = ""
	}
	if (c == null) {
		c = ""
	}
	if (a == "" && c == "") {
		return true
	}
	if (b == "include" && c.indexOf(a) >= 0) {
		return true
	}
	if (b == "exclude" && c.indexOf(a) < 0) {
		return true
	}
	if (b == "start" && c.indexOf(a) == 0) {
		return true
	}
	if (b == "end" && c.lastIndexOf(a) == c.length - a.length) {
		return true
	}
	if (b == "regex" && c.match(a)) {
		return true
	}
	return a == c
}
function preSaveEditableListReportTypeData(m) {
	if (WX_UPDATE_ALLDATA == null) {
		return WX_SAVE_IGNORE
	}
	var e = new Array();
	var c;
	var a = m.metaDataSpanObj.getAttribute("savedatatype");
	var j = null;
	if (a == "changed") {
		j = WX_UPDATE_ALLDATA[m.reportguid]
	} else {
		j = getAllEditableList2DataTrObjs(m.reportguid, null)
	}
	if (j == null || j.length == 0) {
		return WX_SAVE_IGNORE
	}
	var k, l, d = false;
	for (var g = 0, h = j.length; g < h; g = g + 1) {
		k = j[g];
		var b = k.getElementsByTagName("TD");
		c = new Object();
		l = k.getAttribute("EDIT_TYPE");
		if (l == "add") {
			c.WX_TYPE = "add"
		} else {
			c.WX_TYPE = "update"
		}
		var f = getAllSavingData(m, b, c);
		if (f === WX_SAVE_TERMINAT) {
			return f
		}
		if (f === false) {
			continue
		}
		e[e.length] = c;
		d = true
	}
	storeSavingData(m.reportguid, e);
	return d == true ? WX_SAVE_CONTINUE : WX_SAVE_IGNORE
}
function deleteListReportTypeData(a, d) {
	var f = d.lastIndexOf("|") > 0 ? d.substring(d.lastIndexOf("|") + 1) : "";
	var e = null;
	if (f == "all") {
		e = getAllEditableList2DataTrObjs(a.reportguid, null)
	} else {
		if (WX_selectedTrObjs == null) {
			return WX_SAVE_IGNORE
		}
		var c = WX_selectedTrObjs[a.reportguid];
		e = new Array();
		for ( var b in c) {
			e[e.length] = c[b]
		}
	}
	return preDeleteListReportTrObjs(a, e)
}
function deleteEditableListReportRowsImpl(d, a) {
	if (a == null || a.length == 0) {
		return
	}
	var c = getReportMetadataObj(d);
	if (c == null) {
		wx_warn("\u5220\u9664\u6570\u636e\u5931\u8d25\uff0c\u6ca1\u6709\u53d6\u5230guid\u4e3a"
				+ d + "\u7684\u5143\u6570\u636e");
		return
	}
	if (!preDeleteListReportTrObjs(c, a)) {
		return
	}
	var b = addEditableReportSaveDataParams(c);
	if (b == "") {
		return
	}
	var e = getComponentUrl(c.pageid, c.refreshComponentGuid, c.slave_reportid);
	if (e == null || e == "") {
		wx_warn("\u4fdd\u5b58\u6570\u636e\u5931\u8d25\uff0c\u6ca1\u6709\u53d6\u5230guid\u4e3a"
				+ c.reportguid + "\u7684URL");
		return
	}
	e = removeReportNavigateInfosFromUrl(e, c, null);
	e = e + b;
	WX_saveWithDeleteUrl = e;
	if (getDeleteConfirmMessageAsString() == "") {
		doSaveEditableWithDelete("ok")
	} else {
		wx_confirm(getDeleteConfirmMessageAsString(), "\u5220\u9664", null,
				null, doSaveEditableWithDelete)
	}
}
function preDeleteListReportTrObjs(m, k) {
	if (k == null || k.length == 0) {
		return WX_SAVE_IGNORE
	}
	var a = m.metaDataSpanObj.getAttribute("deleteconfirmmessage");
	addDeleteConfirmMessage(getEditableReportDeleteConfirmMessage(k, a));
	var d = new Array();
	var h = new Array();
	var l, j;
	var g = false;
	for (var f = 0; f < k.length; f = f + 1) {
		j = k[f];
		if (j == null) {
			continue
		}
		g = true;
		l = j.getAttribute("EDIT_TYPE");
		if (l == "add") {
			d[d.length] = j
		} else {
			var c = new Object();
			c.WX_TYPE = "delete";
			var e = getAllSavingData(m, j.getElementsByTagName("TD"), c);
			if (e === WX_SAVE_TERMINAT) {
				return e
			}
			if (e === false) {
				continue
			}
			h[h.length] = c
		}
	}
	if (g == false) {
		return WX_SAVE_IGNORE
	}
	var b = new Object();
	b.metadataObj = m;
	if (d.length > 0) {
		b.delNewTrObjArr = d
	}
	if (WX_listReportDeleteInfo == null) {
		WX_listReportDeleteInfo = new Array()
	}
	WX_listReportDeleteInfo[WX_listReportDeleteInfo.length] = b;
	storeSavingData(m.reportguid, h);
	return WX_SAVE_CONTINUE
}
function preSaveEditableDetail2ReportData(j, a) {
	var i = document.getElementById(j.reportguid + "_data");
	if (i == null) {
		wx_warn("\u6ca1\u6709\u53d6\u5230\u9700\u8981\u4fdd\u5b58/\u5220\u9664\u6570\u636e\u7684\u62a5\u8868\u5bf9\u8c61");
		return WX_SAVE_IGNORE
	}
	var d = j.reportguid;
	var f = new Object();
	var e = i.getElementsByTagName("TD");
	if (e == null || e.length == 0) {
		return WX_SAVE_IGNORE
	}
	if (a == WX_SAVETYPE_DELETE) {
		var b = j.metaDataSpanObj.getAttribute("deleteconfirmmessage");
		addDeleteConfirmMessage(getEditableReportDeleteConfirmMessage(e, b));
		f.WX_TYPE = "delete"
	} else {
		var c = j.metaDataSpanObj.getAttribute("savedatatype");
		if (c == "changed"
				&& (WX_UPDATE_ALLDATA == null || WX_UPDATE_ALLDATA[d] == null || WX_UPDATE_ALLDATA[d] == "")) {
			return WX_SAVE_IGNORE
		}
		f.WX_TYPE = "update"
	}
	var h = getAllSavingData(j, e, f);
	if (h === false) {
		return WX_SAVE_IGNORE
	}
	if (h === WX_SAVE_TERMINAT) {
		return h
	}
	var g = new Array();
	g[g.length] = f;
	storeSavingData(j.reportguid, g);
	return f
}
function setColDisplayValueToEditable2Td(b, c) {
	var a = getColInnerWrapElement(b);
	if (a == null) {
		b.innerHTML = c
	} else {
		a.innerHTML = c
	}
}
function getColInnerWrapElement(e) {
	var d = e.childNodes;
	if (d == null || d.length == 0) {
		return null
	}
	var c;
	for (var b = 0, a = d.length; b < a; b++) {
		c = d.item(b);
		if (c.nodeType != 1) {
			continue
		}
		if (c.getAttribute("tagtype") == "COL_CONTENT_WRAP") {
			return c
		}
		c = getColInnerWrapElement(c);
		if (c != null) {
			return c
		}
	}
	return null
}
function getEditable2ColRealValueByFormatemplate(b, c, g, a, e) {
	if ((e == null || e == "")
			&& (g.indexOf("[") != 0 || g.lastIndexOf("]") != g.length - 1)) {
		return e
	}
	if (g.indexOf("[") == 0 && g.lastIndexOf("]") == g.length - 1) {
		g = g.substring(1, g.length - 1)
	}
	var d = b.getAttribute("value_name");
	var n = getReportMetadataObj(c);
	if (n.reportfamily == ReportFamily.EDITABLELIST2) {
		datasObj = wx_getListReportColValuesInRow(b.parentNode, null)
	} else {
		if (n.reportfamily == ReportFamily.EDITABLEDETAIL2) {
			datasObj = getEditableReportColValues(n.pageid, n.reportid, null,
					null)
		} else {
			return e
		}
	}
	if (a == null || a == "") {
		return g
	}
	var j = a.split(";");
	var k, f, l, o;
	for (var h = 0; h < j.length; h++) {
		if (j[h] == null || j[h] == "") {
			continue
		}
		var m = j[h].indexOf("=");
		if (m <= 0) {
			continue
		}
		k = j[h].substring(0, m);
		if (k == null || k == "" || g.indexOf(k) < 0) {
			continue
		}
		f = j[h].substring(m + 1);
		l = f.lastIndexOf("__old") > 0 ? f.substring(0, f.lastIndexOf("__old"))
				: f;
		if (datasObj[l] == null) {
			o = ""
		} else {
			if (l != f && datasObj[l].oldname != null
					&& datasObj[l].oldname != "") {
				o = datasObj[l].oldvalue
			} else {
				if (d == l) {
					o = e
				} else {
					o = datasObj[l].value
				}
			}
		}
		if (o == null) {
			o = ""
		}
		m = g.indexOf(k);
		while (m >= 0) {
			g = g.substring(0, m) + o + g.substring(m + k.length);
			m = g.indexOf(k)
		}
	}
	return g
}
function preSaveEditableDetailReportData(h, a) {
	var d = h.reportguid;
	var i = document.getElementsByName("font_" + d);
	if (i == null || i.length == 0) {
		return null
	}
	var e = new Object();
	e.WX_TYPE = getEditableDetailRealUpdateType(h, a);
	if (e.WX_TYPE == null) {
		return WX_SAVE_IGNORE
	}
	if (a == WX_SAVETYPE_DELETE) {
		var b = h.metaDataSpanObj.getAttribute("deleteconfirmmessage");
		addDeleteConfirmMessage(getEditableReportDeleteConfirmMessage(i, b))
	} else {
		var c = h.metaDataSpanObj.getAttribute("savedatatype");
		if (c == "changed"
				&& (WX_UPDATE_ALLDATA == null || WX_UPDATE_ALLDATA[d] == null || WX_UPDATE_ALLDATA[d] == "")) {
			return WX_SAVE_IGNORE
		}
	}
	var g = getAllSavingData(h, i, e);
	if (g === WX_SAVE_TERMINAT) {
		return g
	}
	if (g === false) {
		return WX_SAVE_IGNORE
	}
	var f = new Array();
	f[f.length] = e;
	storeSavingData(d, f);
	return e
}
function getEditableDetailRealUpdateType(a, b) {
	var d = null;
	if (b == WX_SAVETYPE_DELETE) {
		d = "delete"
	} else {
		var c = a.metaDataSpanObj.getAttribute("current_accessmode");
		if (c == WX_ACCESSMODE_ADD) {
			d = "add"
		} else {
			if (c == WX_ACCESSMODE_UPDATE) {
				d = "update"
			}
		}
	}
	return d
}
function changeReportAccessMode(c, e) {
	var b = getReportMetadataObj(c);
	if (b == null) {
		return
	}
	var d = getComponentUrl(b.pageid, b.refreshComponentGuid, b.slave_reportid);
	if (d == null || d == "") {
		return
	}
	if (e == "") {
		e = null
	}
	var a = b.metaDataSpanObj.getAttribute("current_accessmode");
	if (e == null) {
		if (a == WX_ACCESSMODE_ADD) {
			d = removeReportNavigateInfosFromUrl(d, b, null)
		}
	} else {
		if (e != a && (a == WX_ACCESSMODE_ADD || e == WX_ACCESSMODE_ADD)) {
			d = removeReportNavigateInfosFromUrl(d, b, null)
		}
	}
	d = replaceUrlParamValue(d, b.reportid + "_ACCESSMODE", e);
	refreshComponent(d)
}
function addEditableDetailReportFoSaving(a) {
	if (a == null || a.reportguid == null || a.reportguid == "") {
		return
	}
	doAddDataForSaving(a.reportguid, "true")
}
function popupEditReportPage(d, g) {
	var e = getObjectByJsonString(d);
	var c = getObjectByJsonString(g);
	if (e == null) {
		return
	}
	var a = e.pageurl;
	if (a == null || a == "") {
		return
	}
	var f = e.params;
	if (f != null) {
		for ( var b in f) {
			a = a + "&" + b + "=" + encodeURIComponent(f[b])
		}
	}
	wx_winpage(a, c, e.beforePopupMethod)
}
function closeMeAndRefreshParentReport(b) {
	if (b == null) {
		return
	}
	var a = b.closeme != "false";
	if (WXConfig.prompt_dialog_type == "ymprompt") {
		parent.refreshParentEditableListReport(b.pageid, b.reportid,
				b.edittype, a)
	} else {
		artDialog.open.origin.refreshParentEditableListReport(b.pageid,
				b.reportid, b.edittype, a)
	}
}
function refreshParentEditableListReport(c, f, h, g) {
	if (c == null || c == "" || f == null || f == "") {
		return
	}
	var b = getComponentGuidById(c, f);
	var i = getReportMetadataObj(b);
	if (i == null) {
		return
	}
	if (g === true) {
		closePopupWin(1)
	}
	if (i.slave_reportid == i.reportid) {
		var e = i.metaDataSpanObj.getAttribute("refreshParentReportidOnSave");
		if (e != null && e != "") {
			var d = getReportMetadataObj(getComponentGuidById(c, e));
			var a = getComponentUrl(c, d.refreshComponentGuid, d.slave_reportid);
			if (i.metaDataSpanObj.getAttribute("refreshParentReportTypeOnSave") == "true") {
				a = removeReportNavigateInfosFromUrl(a, d, null)
			}
			refreshComponent(a);
			return
		}
	}
	refreshComponentDisplay(c, f, false)
}
function setBatchEditableColValues(c, j, h) {
	if (h == null || isEmptyMap(h)) {
		return
	}
	if (j == null || j.length == 0) {
		return
	}
	var d;
	for (var e = 0, f = j.length; e < f; e++) {
		d = j[e];
		var g = d.getAttribute("value_name");
		var b = jsonParamDecode(h[g]);
		if (b == null) {
			continue
		}
		var a = jsonParamDecode(h[g + "$label"]);
		if (a == null) {
			a = b
		}
		setEditableColValue(d, b, a)
	}
}
function setEditableColValue(k, b, a) {
	if (k == null) {
		return
	}
	var l = k.getAttribute("value_name");
	if (l == null || l == "") {
		return
	}
	var r = getInputboxIdByParentElementObj(k);
	if (r == null || r == "") {
		return
	}
	var j = getInputboxMetadataObj(r);
	var c = getReportGuidByInputboxId(r);
	var p = getReportMetadataObj(c);
	if (p == null) {
		return
	}
	k.setAttribute("value", b);
	if (j != null && j.getAttribute("displayonclick") !== "true") {
		var d = getUpdateColDestObj(k, c, null);
		if (d == null) {
			setInputBoxValueById(r, b)
		} else {
			setInputBoxLabelById(r, b)
		}
	} else {
		if (a == null) {
			a = b
		}
		if (a == null) {
			a = ""
		}
		if (k.tagName == "FONT") {
			k.innerHTML = a
		} else {
			setColDisplayValueToEditable2Td(k, a)
		}
	}
	var n = p.metaDataSpanObj.getAttribute("current_accessmode");
	if (n != WX_ACCESSMODE_READONLY) {
		var g = k.getAttribute("oldvalue");
		if (g != b) {
			addElementDataForSaving(c, k)
		}
	}
	var f = p.metaDataSpanObj.getAttribute(l + "_onsetvaluemethods");
	var q = getObjectByJsonString(f);
	if (q != null && q.methods != null) {
		var h = q.methods;
		if (h.length > 0) {
			for (var m = 0, o = h.length; m < o; m++) {
				h[m].method(k, b, a)
			}
		}
	}
	if (j != null && j.getAttribute("displayonclick") === "true") {
		var e = j.getAttribute("childboxids");
		if (e != null && e != "") {
			resetTdValue(k, k.getAttribute("oldvalue") == wx_getColValue(k))
		}
	}
}
function saveEditableReportDataImpl(v) {
	if (v == null) {
		return
	}
	WX_deleteConfirmessage = null;
	var d = "";
	var k = v.pageid;
	var h = false;
	var p = false;
	var l = false;
	var q = false;
	var j, c, f, o, n;
	var e = v.savingReportIds;
	if (e == null || e.length == 0) {
		return
	}
	var b = new Array();
	var t = new Object();
	var m = "";
	var u = null;
	var a = 0;
	for (var r = 0, s = e.length; r < s; r = r + 1) {
		if (e[r] == null || !isValidSaveReportParamObj(e[r])) {
			continue
		}
		j = e[r].reportid;
		c = e[r].updatetype;
		if (c != null && c.indexOf("|") > 0) {
			c = c.substring(0, c.indexOf("|"))
		}
		f = getComponentGuidById(k, j);
		o = getReportMetadataObj(f);
		if (o == null) {
			wabacus_info("\u6ca1\u6709\u53d6\u5230\u9875\u9762ID\u4e3a"
					+ k
					+ ",\u62a5\u8868ID\u4e3a"
					+ j
					+ "\u7684\u5143\u6570\u636e\uff0c\u65e0\u6cd5\u5bf9\u5176\u8fdb\u884c\u4fdd\u5b58\u64cd\u4f5c\uff0c\u53ef\u80fd\u6b64\u62a5\u8868\u6ca1\u6709\u663e\u793a\u51fa\u6765");
			continue
		}
		if (!isValidUpdateType(o, c)) {
			continue
		}
		u = doSaveEditableReportData(o, e[r].updatetype);
		if (c == WX_SAVETYPE_DELETE) {
			h = true
		} else {
			l = true
		}
		if (u === WX_SAVE_IGNORE) {
			continue
		}
		if (u === WX_SAVE_TERMINAT) {
			return
		}
		if (u != null && u != "") {
			t[j] = "true";
			if (c == WX_SAVETYPE_DELETE) {
				p = true
			} else {
				q = true
			}
			m += j + ";";
			d = getRealSavingUrl(o, d, b);
			d += u + "&" + j + "_SAVE_ORDER=" + r;
			a++
		} else {
			if (WX_listReportDeleteInfo != null
					&& WX_listReportDeleteInfo.length > 0) {
				p = true
			}
		}
	}
	if (a > 1 && m != "") {
		d = replaceUrlParamValue(d, "refreshComponentGuid", "[DYNAMIC]" + m,
				true)
	}
	if (!hasSaveData(d)
			&& (WX_listReportDeleteInfo == null || WX_listReportDeleteInfo.length == 0)) {
		if (l === true && h === true) {
			wx_warn("\u6ca1\u6709\u8981\u4fdd\u5b58\u548c\u5220\u9664\u7684\u6570\u636e")
		} else {
			if (l === true) {
				wx_warn("\u6ca1\u6709\u8981\u4fdd\u5b58\u7684\u6570\u636e")
			} else {
				wx_warn("\u6ca1\u6709\u8981\u5220\u9664\u7684\u6570\u636e")
			}
		}
		return
	}
	var g = "";
	for (var r = 0; r < b.length; r++) {
		g += b[r] + ";"
	}
	if (g == "") {
		g = null
	}
	d = replaceUrlParamValue(d, "SAVEDSLAVEREPORT_ROOTREPORT_IDS", g);
	if (p) {
		WX_saveWithDeleteUrl = d;
		WX_mSaveReportIds = t;
		if (getDeleteConfirmMessageAsString() == "") {
			doSaveEditableWithDelete("ok")
		} else {
			wx_confirm(getDeleteConfirmMessageAsString(), "\u5220\u9664", null,
					null, doSaveEditableWithDelete)
		}
	} else {
		if (hasSaveData(d)) {
			refreshComponent(d, t)
		}
	}
	WX_deleteConfirmessage = null
}
function getRealSavingUrl(b, d, c) {
	var e = getReportUpdateTypes(b);
	if (e == null) {
		return d
	}
	var a = getComponentUrl(b.pageid, b.refreshComponentGuid, b.slave_reportid);
	a = mergeUrlParams(d, a, false);
	if (b.slave_reportid == b.reportid
			|| b.metaDataSpanObj.getAttribute("isSlaveDetailReport") == "true") {
		if (e.add == true) {
			a = addParentReportParamsToSavingUrl(b, c, a, "OnInsert")
		}
		if (e.update == true) {
			a = addParentReportParamsToSavingUrl(b, c, a, "OnUpdate")
		}
		if (e["delete"] == true) {
			a = addParentReportParamsToSavingUrl(b, c, a, "OnDelete")
		}
	}
	if (e.add === true || e["delete"] === true) {
		a = removeNavigateInfoBecauseOfSave(b, a)
	}
	if (d != null && d != "") {
		a = replaceUrlParamValue(a, "SLAVE_REPORTID", null)
	}
	a = removeLazyLoadParamsFromUrl(a, b, false);
	return a
}
function addParentReportParamsToSavingUrl(a, b, f, d) {
	var e = a.metaDataSpanObj.getAttribute("refreshParentReportid" + d);
	if (e == null || e == "") {
		return f
	}
	if (a.slave_reportid == a.reportid) {
		b[b.length] = e
	}
	var g = getReportMetadataObj(getComponentGuidById(a.pageid, e));
	if (g == null) {
		return f
	}
	var c = getComponentUrl(a.pageid, g.refreshComponentGuid, g.slave_reportid);
	if (a.metaDataSpanObj.getAttribute("refreshParentReportType" + d) == "true") {
		c = removeReportNavigateInfosFromUrl(c, g, null)
	}
	f = mergeUrlParams(f, c, true);
	f = replaceUrlParamValue(f, "SLAVE_REPORTID", null);
	f = removeNavigateInfoBecauseOfSave(a, f);
	return f
}
function getReportUpdateTypes(c) {
	if (WX_ALL_SAVEING_DATA == null) {
		return null
	}
	var e = WX_ALL_SAVEING_DATA[c.reportguid];
	if (e == null || e.length == 0) {
		return null
	}
	var f = new Object();
	var b;
	for (var d = 0, a = e.length; d < a; d++) {
		b = e[d];
		if (b == null) {
			continue
		}
		f[b.WX_TYPE] = true
	}
	return f
}
var WX_mSaveReportIds;
var WX_deleteConfirmessage;
var WX_saveWithDeleteUrl;
var WX_listReportDeleteInfo;
function doSaveEditableWithDelete(m) {
	if (wx_isOkConfirm(m)) {
		if (WX_listReportDeleteInfo != null
				&& WX_listReportDeleteInfo.length > 0) {
			var a;
			for (var h = 0, f = WX_listReportDeleteInfo.length; h < f; h = h + 1) {
				a = WX_listReportDeleteInfo[h];
				if (a == null || a.metadataObj == null) {
					continue
				}
				var l = null;
				if (WX_UPDATE_ALLDATA != null) {
					l = WX_UPDATE_ALLDATA[a.metadataObj.reportguid]
				}
				if (l != null && l.length == 0) {
					l = null
				}
				if (a.delNewTrObjArr != null && a.delNewTrObjArr.length > 0) {
					var d;
					for (var g = 0, e = a.delNewTrObjArr.length; g < e; g = g + 1) {
						d = a.delNewTrObjArr[g];
						if (l != null) {
							for (var c = 0, b = l.length; c < b; c = c + 1) {
								if (l[c] == d) {
									l.splice(c, 1);
									if (l.length == 0) {
										if (WX_UPDATE_ALLDATA != null) {
											delete WX_UPDATE_ALLDATA[a.metadataObj.reportguid]
										}
										break
									}
								}
							}
						}
						d.parentNode.removeChild(d);
						setListReportChangedRowNumInClient(
								a.metadataObj.reportguid, -1, false)
					}
				}
				if (WX_selectedTrObjs != null) {
					delete WX_selectedTrObjs[a.metadataObj.reportguid]
				}
			}
		}
		if (hasSaveData(WX_saveWithDeleteUrl)) {
			refreshComponent(WX_saveWithDeleteUrl, WX_mSaveReportIds)
		}
	}
	WX_saveWithDeleteUrl = null;
	WX_listReportDeleteInfo = null;
	WX_deleteConfirmessage = null;
	WX_mSaveReportIds = null
}
function isValidSaveReportParamObj(c) {
	var a = c.reportid;
	var b = c.updatetype;
	if (a == null || a == "") {
		wx_warn("\u4fdd\u5b58\u6570\u636e\u5931\u8d25,\u53c2\u6570\u4e2d\u6ca1\u6709\u53d6\u5230\u62a5\u8868ID");
		return false
	}
	if (b == null || b == "") {
		wx_warn("\u4fdd\u5b58\u6570\u636e\u5931\u8d25\uff0c\u6ca1\u6709\u53d6\u5230\u4fdd\u5b58\u7c7b\u578b");
		return false
	}
	return true
}
function isValidUpdateType(b, c) {
	var a = b.reportfamily;
	if (a != ReportFamily.EDITABLELIST2 && a != ReportFamily.LISTFORM
			&& a != ReportFamily.EDITABLEDETAIL2
			&& a != ReportFamily.EDITABLELIST
			&& a != ReportFamily.EDITABLEDETAIL && a != ReportFamily.FORM) {
		wx_warn(b.reportid
				+ "\u5bf9\u5e94\u7684\u62a5\u8868\u7c7b\u578b\u4e0d\u53ef\u7f16\u8f91\uff0c\u4e0d\u80fd\u4fdd\u5b58\u5176\u6570\u636e");
		return false
	}
	var d = b.metaDataSpanObj.getAttribute("current_accessmode");
	if (d == WX_ACCESSMODE_READONLY) {
		return false
	}
	if (a == ReportFamily.EDITABLEDETAIL || a == ReportFamily.FORM) {
		if (c == WX_SAVETYPE_DELETE) {
			if (d == WX_ACCESSMODE_ADD) {
				return false
			}
		} else {
			if (d != WX_ACCESSMODE_ADD && d != WX_ACCESSMODE_UPDATE) {
				return false
			}
		}
	}
	if (a == ReportFamily.EDITABLELIST && c != WX_SAVETYPE_DELETE) {
		wx_warn(b.reportid
				+ "\u62a5\u8868\u4e3aeditablelist\u7c7b\u578b\uff0c\u4e0d\u80fd\u76f4\u63a5\u5bf9\u5176\u505a\u6dfb\u52a0\u4fee\u6539\u64cd\u4f5c");
		return false
	}
	return true
}
function removeNavigateInfoBecauseOfSave(b, c) {
	var a = b.reportfamily;
	var e = b.metaDataSpanObj.getAttribute("navigate_reportid");
	if (e == null || e == "") {
		return c
	}
	var f = b.metaDataSpanObj.getAttribute("current_accessmode");
	if (f == WX_ACCESSMODE_READONLY) {
		return c
	}
	var d = getParamValueFromUrl(c, e + "_PAGENO");
	c = removeReportNavigateInfosFromUrl(c, b, null);
	if (d != null && d != "") {
		c = c + "&" + e + "_DYNPAGENO=" + d
	}
	return c
}
function doSaveEditableReportData(h, g) {
	var a = (g != null && g.indexOf("|") > 0) ? g = g.substring(0, g
			.indexOf("|")) : g;
	var e = h.reportfamily;
	var b = h.reportguid;
	var f = null;
	if (e == ReportFamily.EDITABLEDETAIL || e == ReportFamily.FORM) {
		f = preSaveEditableDetailReportData(h, a);
		if (f === WX_SAVE_TERMINAT || f === WX_SAVE_IGNORE) {
			return f
		}
		a = getEditableDetailRealUpdateType(h, g)
	} else {
		if (e == ReportFamily.EDITABLELIST2 || e == ReportFamily.LISTFORM) {
			if (a == WX_SAVETYPE_DELETE) {
				f = deleteListReportTypeData(h, g);
				if (f === WX_SAVE_TERMINAT || f === WX_SAVE_IGNORE) {
					return f
				}
			} else {
				f = preSaveEditableListReportTypeData(h);
				if (f === WX_SAVE_TERMINAT || f === WX_SAVE_IGNORE) {
					return f
				}
				a = ""
			}
		} else {
			if (e == ReportFamily.EDITABLEDETAIL2) {
				f = preSaveEditableDetail2ReportData(h, a);
				if (f === WX_SAVE_IGNORE || f === WX_SAVE_TERMINAT) {
					return f
				}
				a = f.WX_TYPE
			} else {
				if (e == ReportFamily.EDITABLELIST) {
					f = deleteListReportTypeData(h, g);
					if (f === WX_SAVE_TERMINAT || f === WX_SAVE_IGNORE) {
						return f
					}
				} else {
					return WX_SAVE_IGNORE
				}
			}
		}
	}
	var k = h.metaDataSpanObj.getAttribute("beforeSaveAction");
	var i = getObjectByJsonString(k);
	if (WX_ALL_SAVEING_DATA == null) {
		WX_ALL_SAVEING_DATA = new Object()
	}
	if (i != null && i.method != null) {
		var j = i.method(h.pageid, h.reportid,
				WX_ALL_SAVEING_DATA[h.reportguid]);
		if (j === WX_SAVE_IGNORE || j === WX_SAVE_TERMINAT) {
			return j
		}
	}
	var d = addEditableReportSaveDataParams(h);
	var c = addAllCustomizeParamValues(h, WX_ALL_SAVEING_DATA[h.reportguid], a);
	if (c != null && c != "") {
		d = d + "&" + c
	}
	return d
}
function addEditableReportSaveDataParams(l) {
	var d = WX_ALL_SAVEING_DATA[l.reportguid];
	if (d == null || d.length == 0) {
		return ""
	}
	var f;
	var m = "", a = "", b = "";
	for (var e = 0, g = d.length; e < g; e++) {
		f = d[e];
		if (f == null) {
			continue
		}
		var k = "", c = "";
		for ( var j in f) {
			if (j == "WX_TYPE") {
				k = f[j]
			} else {
				c += j + SAVING_NAMEVALUE_SEPERATOR
						+ (f[j] == null ? "[W-X-N-U-L-L]" : f[j])
						+ SAVING_COLDATA_SEPERATOR
			}
		}
		if (c.lastIndexOf(SAVING_COLDATA_SEPERATOR) == c.length
				- SAVING_COLDATA_SEPERATOR.length) {
			c = c.substring(0, c.length - SAVING_COLDATA_SEPERATOR.length)
		}
		if (c == "" || k == ""
				|| (k != "add" && k != "update" && k != "delete")) {
			continue
		}
		if (k == "add") {
			m += c + SAVING_ROWDATA_SEPERATOR
		} else {
			if (k == "delete") {
				b += c + SAVING_ROWDATA_SEPERATOR
			} else {
				a += c + SAVING_ROWDATA_SEPERATOR
			}
		}
	}
	if (m.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == m.length
			- SAVING_ROWDATA_SEPERATOR.length) {
		m = m.substring(0, m.length - SAVING_ROWDATA_SEPERATOR.length)
	}
	if (a.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == a.length
			- SAVING_ROWDATA_SEPERATOR.length) {
		a = a.substring(0, a.length - SAVING_ROWDATA_SEPERATOR.length)
	}
	if (b.lastIndexOf(SAVING_ROWDATA_SEPERATOR) == b.length
			- SAVING_ROWDATA_SEPERATOR.length) {
		b = b.substring(0, b.length - SAVING_ROWDATA_SEPERATOR.length)
	}
	var h = "";
	if (m != "") {
		h += "&" + l.reportid + "_INSERTDATAS=" + encodeURIComponent(m)
	}
	if (a != "") {
		h += "&" + l.reportid + "_UPDATEDATAS=" + encodeURIComponent(a)
	}
	if (b != "") {
		h += "&" + l.reportid + "_DELETEDATAS=" + encodeURIComponent(b)
	}
	return h
}
function addAllCustomizeParamValues(b, e, d) {
	if (WX_CUSTOMIZE_DATAS == null) {
		return ""
	}
	var a = WX_CUSTOMIZE_DATAS[b.reportguid];
	if (a == null) {
		return ""
	}
	var f = "";
	for ( var c in a) {
		if (a[c] == null || a[c] == "") {
			continue
		}
		f = f + c + SAVING_NAMEVALUE_SEPERATOR + a[c]
				+ SAVING_COLDATA_SEPERATOR
	}
	if (f.lastIndexOf(SAVING_COLDATA_SEPERATOR) == f.length
			- SAVING_COLDATA_SEPERATOR.length) {
		f = f.substring(0, f.length - SAVING_COLDATA_SEPERATOR.length)
	}
	if (f == "") {
		return ""
	}
	if (d != null && d != "") {
		f = f + SAVING_COLDATA_SEPERATOR + "WX_UPDATETYPE"
				+ SAVING_NAMEVALUE_SEPERATOR + d;
		a.WX_TYPE = "customize." + d
	} else {
		a.WX_TYPE = "customize"
	}
	if (e == null) {
		e = new Array();
		storeSavingData(b.reportguid, e)
	}
	e[e.length] = a;
	delete WX_CUSTOMIZE_DATAS[b.reportguid];
	return b.reportid + "_CUSTOMIZEDATAS=" + encodeURIComponent(f)
}
function setCustomizeParamValue(c, e, b, f) {
	if (WX_CUSTOMIZE_DATAS == null) {
		WX_CUSTOMIZE_DATAS = new Object()
	}
	var d = getComponentGuidById(c, e);
	var a = WX_CUSTOMIZE_DATAS[d];
	if (a == null) {
		a = new Object();
		WX_CUSTOMIZE_DATAS[d] = a
	}
	a[b] = f;
	doAddDataForSaving(d, "true")
}
function hasSaveData(a) {
	if (a == null || a == "") {
		return false
	}
	if (a.indexOf("_INSERTDATAS=") < 0 && a.indexOf("_UPDATEDATAS=") < 0
			&& a.indexOf("_DELETEDATAS=") < 0
			&& a.indexOf("_CUSTOMIZEDATAS=") < 0) {
		return false
	}
	return true
}
function getAllSavingData(d, h, c) {
	if (h == null || h.length == 0) {
		return false
	}
	var g;
	var f = false;
	for (var e = 0, b = h.length; e < b; e++) {
		g = h[e];
		var a = g.getAttribute("value_name");
		if (a == null || a == "") {
			continue
		}
		c[a] = wx_getColValue(g);
		f = true;
		if (c.WX_TYPE !== "add") {
			c[a + "__old"] = g.getAttribute("oldvalue")
		}
	}
	if (f && (c == null || c.WX_TYPE !== "delete")) {
		for (var e = 0, b = h.length; e < b; e++) {
			if (!validateEditColBoxValue(d, c, h[e], false)) {
				return WX_SAVE_TERMINAT
			}
		}
	}
	return f
}
function storeSavingData(a, b) {
	if (WX_ALL_SAVEING_DATA == null) {
		WX_ALL_SAVEING_DATA = new Object()
	}
	WX_ALL_SAVEING_DATA[a] = b
}
function getEditableReportDeleteConfirmMessage(g, e) {
	if (e == null || e.indexOf("@{") < 0) {
		return e
	}
	var d = new Object();
	e = parseDeleteConfirmInfo(e, d);
	var a = wx_getAllColValueByParentElementObjs(g, null);
	if (a == null) {
		return e
	}
	var f, b;
	for ( var c in d) {
		f = d[c];
		b = "";
		if (f != null) {
			if (f.lastIndexOf("__old") == f.length - "__old".length) {
				f = f.substring(0, f.lastIndexOf("__old"));
				if (a[f] != null) {
					b = a[f].oldvalue
				}
			} else {
				if (a[f] != null) {
					b = a[f].value
				}
			}
			if (b == null) {
				b = ""
			}
		}
		e = e.replace(c, b)
	}
	return e
}
function parseDeleteConfirmInfo(c, b) {
	if (c == null || c.indexOf("@{") < 0) {
		return c
	}
	var a = c.indexOf("@{");
	var f, d;
	var e = 0;
	while (a >= 0) {
		f = c.substring(0, a);
		c = c.substring(a + 2);
		a = c.indexOf("}");
		if (a < 0) {
			break
		}
		d = c.substring(0, a);
		c = c.substring(a + 1);
		b["PLACE_HOLDER_" + e] = d;
		c = f + "PLACE_HOLDER_" + e + c;
		e++;
		a = c.indexOf("@{")
	}
	return c
}
function addDeleteConfirmMessage(b) {
	if (b == null || b == "" || b == "none") {
		return
	}
	if (WX_deleteConfirmessage == null) {
		WX_deleteConfirmessage = new Array()
	}
	for (var a = 0; a < WX_deleteConfirmessage.length; a++) {
		if (WX_deleteConfirmessage[a] == b) {
			return
		}
	}
	WX_deleteConfirmessage[WX_deleteConfirmessage.length] = b
}
function getDeleteConfirmMessageAsString() {
	if (WX_deleteConfirmessage == null) {
		return ""
	}
	var b = "";
	for (var a = 0; a < WX_deleteConfirmessage.length; a++) {
		if (WX_deleteConfirmessage[a] == null
				|| WX_deleteConfirmessage[a] == ""
				|| WX_deleteConfirmessage[a] == "none") {
			return
		}
		b += WX_deleteConfirmessage[a] + "\n"
	}
	return b
}
var WX_MGROUP_NAME_FLAG = new Object();
function fillGroupBoxValue(a) {
	WX_MGROUP_NAME_FLAG[a.getAttribute("id")] = "";
	setTimeout(function() {
		doFillGroupBoxValue(a)
	}, 130)
}
function doFillGroupBoxValue(c) {
	var b = WX_MGROUP_NAME_FLAG[c.getAttribute("id")];
	if (b !== "true") {
		var a = c.getAttribute("id");
		if (a.lastIndexOf("__") > 0) {
			a = a.substring(0, a.lastIndexOf("__"))
		}
		fillBoxValueToParentElement(c, a, true)
	}
}
function setGroupBoxStopFlag(a) {
	WX_MGROUP_NAME_FLAG[a.getAttribute("id")] = "true"
}
function loadAutoCompleteInputboxData(h, i) {
	var m = getInputboxParentElementObj(h);
	var d = getInputboxIdByParentElementObj(m);
	var b = getReportGuidByInputboxId(d);
	var k = getReportMetadataObj(b);
	var n = wx_getColValue(m);
	if (n == h.autoComplete_oldData) {
		return
	}
	var l = wx_getAllSiblingColValuesByInputboxid(d, i);
	if (l == null) {
		return
	}
	var e = "";
	var c;
	var f;
	for ( var j in l) {
		c = l[j];
		if (c == null) {
			continue
		}
		f = c.value;
		if (f == null) {
			f = ""
		}
		e += j + SAVING_NAMEVALUE_SEPERATOR + f + SAVING_COLDATA_SEPERATOR
	}
	if (e.lastIndexOf(SAVING_COLDATA_SEPERATOR) == e.length
			- SAVING_COLDATA_SEPERATOR.length) {
		e = e.substring(0, e.length - SAVING_COLDATA_SEPERATOR.length)
	}
	var a = getComponentUrl(k.pageid, k.refreshComponentGuid, k.slave_reportid);
	a = replaceUrlParamValue(a, "REPORTID", k.reportid);
	a = replaceUrlParamValue(a, "ACTIONTYPE", "GetAutoCompleteFormData");
	a = replaceUrlParamValue(a, "INPUTBOXID", d);
	a = replaceUrlParamValue(a, "AUTOCOMPLETE_COLCONDITION_VALUES", e);
	var g = new Object();
	g.pageid = k.pageid;
	g.reportid = k.reportid;
	g.inputboxid = d;
	sendAsynRequestToServer(a, fillAutoCompleteColsMethod,
			onGetAutoCompleteDataErrorMethod, g)
}
function fillAutoCompleteColsMethod(f, g) {
	var c = f.responseText;
	if (c == null || c == " " || c == "") {
		return
	}
	var d = getObjectByJsonString(c);
	var b = g.inputboxid;
	var h = b.lastIndexOf("__") > 0 ? b.substring(b.lastIndexOf("__") + 2) : "";
	var e = h != "" ? document.getElementById(getReportGuidByInputboxId(b)
			+ "_tr_" + h) : null;
	if (e != null) {
		var a = getComponentGuidById(g.pageid, g.reportid);
		setEditableListReportColValueInRow(g.pageid, g.reportid, e, d)
	} else {
		setEditableReportColValue(g.pageid, g.reportid, d, null)
	}
}
function onGetAutoCompleteDataErrorMethod(a) {
	wx_error("\u83b7\u53d6\u81ea\u52a8\u586b\u5145\u8868\u5355\u57df\u6570\u636e\u5931\u8d25")
}
function stopSaveForDemo() {
	wx_win(
			"<div style='font-size:15px;color:#CC3399'><br>\u8fd9\u91cc\u662f\u516c\u5171\u6f14\u793a\uff0c\u4e0d\u5141\u8bb8\u4fdd\u5b58\u6570\u636e\u5230\u540e\u53f0<br><br>\u60a8\u53ef\u4ee5\u5728\u672c\u5730\u90e8\u7f72WabacusDemo\u6f14\u793a\u9879\u76ee\uff0c\u8fdb\u884c\u5b8c\u5168\u4f53\u9a8c\uff0c\u53ea\u9700\u51e0\u6b65\u5373\u53ef\u90e8\u7f72\u5b8c\u6210<br><br>WabacusDemo.war\u4f4d\u4e8e\u4e0b\u8f7d\u5305\u7684samples/\u76ee\u5f55\u4e2d</div>",
			{
				lock : true
			});
	return false
}
var WX_EDITSYSTEM_LOADED = true;
