<%@ page contentType="text/html; charset=UTF-8"
	import="com.hilltop.security.Login,com.wabacus.system.ReportRequest"%>

<%
	//获取login.html提交来的信息
	String user_id = request.getParameter("TxtUserID");
	String password = request.getParameter("TxtPassword");
	Login login = new Login();
	boolean isLegal = login.checkPrivilege(user_id, password, session);
	if (isLegal) {//request.getContextPath()
		String continue_url=(String)session.getAttribute("continue_url");
		response.sendRedirect(continue_url==null?request.getContextPath():continue_url);
		//out.print("<script>window.parent.location.href='"+request.getContextPath()+"'</script>");
	} else
	//登录失败,或者没设置登录权限，回到首页。
	{
		out.print("<script>window.location.href='loginError.html'</script>");
	}
%>