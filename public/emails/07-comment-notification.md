alias: `comment-notification`

subject: `{{commenter_name}} made a comment on {{ folio }}`

body:
`

<p>{{ body }}</p>
<p>By {{commenter_name}} ({{commenter_email}}) at {{timestamp}}</p>

<p class="sub"><a href="{{action_url}}">View the comment</a></p>

<!-- End -->

<!-- Sub copy -->

<table class="body-sub">
  <tr>
    <td>
      <p class="sub">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
      <p class="sub">{{action_url}}</p>
    </td>
  </tr>
</table>
`
