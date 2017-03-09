<%@ page contentType="text/html; charset=UTF-8"%>
<% if(session.getAttribute("user_id")==null||session.getAttribute("user_id")=="") {
	out.println("<script>window.location.href='login.html'</script>");
}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN" dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>修改密码</title>
<link href="changePassword.css" media="screen" rel="stylesheet"
	type="text/css" />

<script src="changePassword.js" type="text/javascript"></script>
</head>
<body>
	<div id="content" class="clearfix">
		<div id="main">
			<form action="changePassword" id="setting_form" method="post">
				<div style="margin: 0; padding: 0; display: inline"></div>
				<fieldset>
					<ul>
						<li><label for="old_password">旧密码</label> <input
							type="password" name="old_password" id="old_password"
							class="text required" /></li>
						<li><label for="new_password">新密码</label> <input
							type="password" name="new_password" id="new_password"
							class="text required min-length-3 max-length-20" />&nbsp;&nbsp;密码长度在3~20之间
						</li>
						<li><label for="new_password_confirmation">新密码确认</label> <input
							type="password" name="new_password_confirmation"
							id="new_password_confirmation"
							class="text required equals-new_password" /></li>
						<li>如果有疑问,请致电管理员.</li>
					</ul>
				</fieldset>
				<div style="text-align: center;">
					<input class="submit" id="submit_button" name="commit"
						type="submit" value="提交" />
				</div>
			</form>
			<script type="text/javascript">
				new Validation("setting_form");
			</script>

		</div>
	</div>

</body>
</html>
