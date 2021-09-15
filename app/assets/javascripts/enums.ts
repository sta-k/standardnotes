export enum HtmlInputType {
  Button = 'button',
  Checkbox = 'checkbox',
  Color = 'color',
  Date = 'date',
  DateTimeLocal = 'datetime-local',
  Email = 'email',
  File = 'file',
  Hidden = 'hidden',
  Image = 'image',
  Month = 'month',
  Number = 'number',
  Password = 'password',
  Radio = 'radio',
  Range = 'range',
  Reset = 'reset',
  Search = 'search',
  Submit = 'submit',
  Tel = 'tel',
  Text = 'text',
  Time = 'time',
  Url = 'url',
  Week = 'week'
}

export enum ErrorMessage {
  EnterPassword = 'Please enter your password.',
  InvalidEmailFormat = 'The email you entered has an invalid format. Please review your input and try again.',
  SomeFieldsAreNoteFilled = 'Some fields have not been filled out. Please fill out all fields and try again.',
  EnterCurrentPassword = 'Please enter your current password.',
  EnterNewPassword = 'Please enter a new password.',
  IncorrectPassword = 'The current password you entered is not correct. Please try again.',
  PasswordAndConfirmationDontMatch = 'Your new password does not match its confirmation.',
  NoEmailStored = 'We don\'t have your email stored. Please log out then log back in to fix this issue.',
  SomethingWentWrong = 'Something went wrong. Please try later.',
  CantCloseWithPendingTasks = 'Cannot close window until pending tasks are complete.',
}
