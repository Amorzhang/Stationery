package com.hilltop.security;

import java.io.IOException;
import java.sql.*;

import javax.servlet.http.HttpSession;

import com.wabacus.config.Config;
import com.wabacus.system.*;
import com.wabacus.system.intercept.AbsPageInterceptor;

public class GlobalInterceptor extends AbsPageInterceptor {
	public void doStart(ReportRequest rrequest) {
		String pageid = rrequest.getPagebean().getId();
		HttpSession session = rrequest.getRequest().getSession();
		Connection conn = rrequest.getConnection();
		String user_id = (String) session.getAttribute("user_id");
		if (user_id == null || "".equals(user_id)) {
			// 用户没登录则跳转到登录页面
			session.setAttribute("continue_url", rrequest.getUrl());
			if (rrequest.isLoadedByAjax()) {// ajax请求
				rrequest.getWResponse().addOnloadMethod("wx_sendRedirect","{url:\"" +rrequest.getRequest().getContextPath() + "\"}", false);
				rrequest.getWResponse().terminateResponse(1);
			} else {
				try {
					//跳转到home页
					rrequest.getWResponse().getResponse().sendRedirect(rrequest.getRequest().getContextPath()+"/jsp/login/login.html");
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		} else {
			// 已登录用户,生成登录用户菜单,把菜单代码放到session中,在page的header中调用
			if (!rrequest.isLoadedByAjax()) {
				session.setAttribute("menu_list", createMenu(user_id, conn, rrequest));
			}
		}

		// 对要访问的页面进行授权\
		StringBuffer sql = new StringBuffer();
		sql.append("select a.user_id,b.privilege_id ,c.page_id,c.component_id,c.part_type,c.part_id,c.permission_type,c.permission_value  ");
		sql.append(" from sys_c_sec_user a,sys_c_sec_gppv b,sys_c_sec_pvlt c ");
		sql.append(" where a.group_id=b.group_id and b.privilege_id=c.privilege_id ");
		sql.append(" and a.user_id=? and page_id=? ");
		//System.out.println(sql);
		PreparedStatement pstmt = null;

		try {
			pstmt = conn.prepareStatement(sql.toString());
			pstmt.setString(1, (String) session.getAttribute("user_id"));
			pstmt.setString(2, pageid);
			ResultSet rs = pstmt.executeQuery();
			boolean hasRows = false;

			while (rs.next()) {
				hasRows = true;
				// System.out.println("开始授权!");
				rrequest.authorize(rs.getString("component_id"),
						rs.getString("part_type"), rs.getString("part_id"),
						rs.getString("permission_type"),
						rs.getString("permission_value"));
			}
			if (!hasRows) {
				disablePage(pageid, conn, rrequest);
			}
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
		}
	}

	public void doEnd(ReportRequest rrequest) {
		// 增加记录点击率的功能
		if (!rrequest.isLoadedByAjax()) {// 不是ajax请求
			recordHits(rrequest, rrequest.getStringAttribute("PAGEID"));
		}
	}

	// 禁用页面
	public void disablePage(String pageid, Connection conn, ReportRequest rrequest) {
		rrequest.authorize("common_vpanel", null, null, "disabled", "true");
	}

	// 根据user_id生成导航菜单
	public String createMenu(String user_id, Connection conn, ReportRequest rrequest) {
		String login_user = (String) rrequest.getRequest().getSession().getAttribute("user_name");
		String sql = " select menu_id,menu_type,menu_name,menu_seq,page_id,page_name,url_param,mt_seq  "
				+ " from ( "
				+ " 	select mt.menu_id,m.menu_type,m.menu_name,m.seq as menu_seq,mt.page_id,mt.page_name,mt.url_param,mt.seq as mt_seq   "
				+ " 	from sys_c_sec_user u,sys_c_app_mnlt mt,sys_c_app_menu m  "
				+ " 	where user_id=? and u.is_enable='Y' and m.menu_type='normal' and u.group_id=mt.group_id and  mt.menu_id=m.menu_id  and mt.is_show='Y'  "
				+ " 	union "
				+ " 	select 'favor' as menu_id,'normal' as menu_type,'我的收藏' as menu_name,999999 as menu_seq,mt.page_id,mt.page_name,mt.url_param,mt.seq as mt_seq "
				+ " 	from sys_c_app_mnlt mt   "
				+ " 	left join sys_c_sec_user u on u.group_id=mt.group_id and u.is_enable='Y'  "
				+ " 	left join sys_c_app_menu m on mt.menu_id=m.menu_id   "
				+ " 	left join sys_c_sec_page p on mt.page_id=p.page_id   "
				+ " 	right join sys_c_per_fvor f on mt.page_id=f.page_id and f.user_id=u.user_id   "
				+ "   where u.user_id=? and mt.is_show='Y'" 
				+ "   union "
				+ "	select menu_id,'url' as menu_type,menu_name,seq,menu_type,'','',0 from sys_c_app_menu "
				+ "	where menu_type<>'normal' ) list order by menu_seq,mt_seq,page_id";
		//System.out.println("menu sql :"+sql);
		PreparedStatement pstmt = null;
		StringBuffer sb = new StringBuffer();
		//sb.append("	<title>Information System</title>\n");
		sb.append("    <link rel='shortcut icon' href='shortcut.png' />");
		sb.append("	<div id='header'>\n");
		sb.append("		<div id='masthead'>"
				+ "<table cellspacing='0' cellpadding='0' width='100%' border='0'>"
				+ "	<tbody>" 
				+ "		<tr height='60px'>"
				+ "			<td width='150' id='logo_img'>" 
				+ "			</td>    "
				+ "			<td align='left' id='logo'>"+Config.getInstance().getSystemConfigValue("system_name", "")+""
				+ "			</td>");

		if (user_id == null || "".equals(user_id)) {
			sb.append("			<td align='right' width='300' style='FONT-WEIGHT: bold; COLOR: #fff; padding-right:15px' > &nbsp;&nbsp;&nbsp;&nbsp;");
			sb.append("				<a style='COLOR: #fff;text-decoration: underline;' href='jsp/login/login.html'>请登录</a>");
		} else {
			sb.append("			<td align='right' width='300' style='FONT-WEIGHT: bold; COLOR: #fff; padding-right:15px' >欢迎您, " + login_user + "&nbsp;&nbsp;&nbsp;&nbsp;");
			sb.append("				<a style='COLOR: #fff;text-decoration: underline;' href='javascript:void(0)' onclick=\"wx_winpage('ShowReport.wx?PAGEID=change_password',{title:'我的密码',lock:true,width:500,height:260})\" target='_BLANK'>修改密码</a>");
			sb.append("				<a style='COLOR: #fff;text-decoration: underline;' href='jsp/login/logout.jsp'>退出系统</a>");
		}
		sb.append("			</td>    " + "		</tr>" + "	</tbody>" + "</table>" + "</div>\n");
		sb.append("		<div id='dd-navigation'>\n");
		sb.append("			<div id='nav-strip'>\n");
		sb.append("				<ul>\n");
		//sb.append("					<li class='nav-item no-subnav' id='nav-item_1'><a href='index.jsp'><span class='primary-link'>首页</span></a></li>\n");
		sb.append("\n");
		try {
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, user_id);
			pstmt.setString(2, user_id);
			ResultSet rs = pstmt.executeQuery();
			String temp_menu_type="";
			
			String tmp1=null;
			while (rs.next()) {
				String menu_type = rs.getString("menu_type");
				
				if("url".equals(menu_type)){
					sb.append("normal".equals(temp_menu_type)?"						</ul></div></div></li>\n":"");
					sb.append("					<li class='nav-item no-subnav' id='nav-item_"+ rs.getString("menu_id")+"'><a href='"+rs.getString("page_id").substring(4)+"'><span class='primary-link'>"+ rs.getString("menu_name") +"</span></a></li>\n");
				}else  if (tmp1==null) {
					sb.append("					<li class='nav-item' id='nav-item_" + rs.getString("menu_id") + "'><a href='javascript:void(0)'><span class='primary-link'>" + rs.getString("menu_name") + "</span></a>\n");
					sb.append("						<div class='subnav' id='subnav_" + rs.getString("menu_id")	+ "'><div class='subnav-inner'><ul class='one'>\n");
					sb.append("						    <li class='nav-item-li'><a href='ShowReport.wx?MENUID="+rs.getString("menu_id")+"&PAGEID=" + rs.getString("page_id") + (rs.getString("url_param") ==null?"":rs.getString("url_param"))+ "'>" + rs.getString("page_name") + "</a></li>\n");
				}else if (!tmp1.equals(rs.getString("menu_id"))) {
					sb.append("url".equals(temp_menu_type)?"":"						</ul></div></div></li>\n");
					sb.append("					<li class='nav-item' id='nav-item_" + rs.getString("menu_id") + "'><a href='javascript:void(0)'><span class='primary-link'>" + rs.getString("menu_name") + "</span></a>\n");
					sb.append("						<div class='subnav' id='subnav_" + rs.getString("menu_id") + "'><div class='subnav-inner'><ul class='one'>\n");
					sb.append("						    <li class='nav-item-li'><a href='ShowReport.wx?MENUID="+rs.getString("menu_id")+"&PAGEID=" + rs.getString("page_id") + (rs.getString("url_param") ==null?"":rs.getString("url_param")) + "'>" + rs.getString("page_name") + "</a></li>\n");
				}else {
					sb.append("						    <li class='nav-item-li'><a href='ShowReport.wx?MENUID="+rs.getString("menu_id")+"&PAGEID=" + rs.getString("page_id") + (rs.getString("url_param") ==null?"":rs.getString("url_param")) + "'>" + rs.getString("page_name") + "</a></li>\n");
				}

				tmp1=rs.getString("menu_id");
				temp_menu_type = rs.getString("menu_type");
			}
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
		}

		sb.append("						</ul></div></div></li>\n");
		sb.append("				</ul>\n");
		sb.append("			</div>\n");
		sb.append("		</div>\n");
		sb.append("	</div>\n");
		//System.out.println(sb.toString());
		return sb.toString();
	}

	public void recordHits(ReportRequest rrequest, String page_id) {
		String updateSql = "update sys_c_sec_page set hits=(case when hits is null then 1 else hits+1 end)  where page_id=? ";
		Connection conn = rrequest.getConnection();
		PreparedStatement pstmt2 = null;
		try {
			pstmt2 = conn.prepareStatement(updateSql);
			pstmt2.setString(1, page_id);
			pstmt2.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
