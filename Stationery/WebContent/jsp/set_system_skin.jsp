<%@ page language="java" contentType="text/html;charset=UTF-8"%>
<%@ page import="com.wabacus.config.Config"%>
<%
	String myskin=request.getParameter("myskin");//本页面的主题风格
	String globalskin=request.getParameter("globalskin");//全局主题风格
	myskin=myskin==null?"":myskin.trim();
	globalskin=globalskin==null?"":globalskin.trim();
	boolean hasSetSkin=false;
	if(!myskin.equals(""))
	{//设置了本页面的主题风格
		Config.getInstance().setSkin(request,"set_system_skin",myskin);
		hasSetSkin=true;
	}
	if(!globalskin.equals(""))
	{//设置了整个项目的全局风格
		Config.getInstance().setSkin(request,"",globalskin);
		hasSetSkin=true;
	}
	if(hasSetSkin)
	{//如果设置了主题风格，则刷新一下整个页面
		response.sendRedirect(request.getContextPath()+"/ShowReport.wx?PAGEID=set_system_skin");
		return;
	}
	myskin=Config.getInstance().getSkin(request,"set_system_skin");//取到页面的主题风格
	globalskin=Config.getInstance().getSkin(request,"");//取到全局的主题风格
%>

<form name="frm2" action="jsp/set_system_skin.jsp" style="margin: 30px">
	<table width='100%' border="0">
		<tr>
			<td align='left' width='120px'><font size="2">请选择主题风格：</font></td>
			<td align='left' width='60px'><select name="globalskin">
					<option value="vista" <%="vista".equals(globalskin)?"selected":""%>>vista</option>
					<option value="qq" <%="qq".equals(globalskin)?"selected":""%>>qq</option>
					<option value="hilltop"
						<%="hilltop".equals(globalskin)?"selected":""%>>hilltop</option>
			</select></td>
			<td align='left' width='60px'><input type="submit" value="设置" />
			</td>
			<td align='left'>[<font color='red' size="2">说明：</font><font
				size="2" color='blue'>设置完成后会影响所有页面</font>]
			</td>
		</tr>
	</table>
</form>
