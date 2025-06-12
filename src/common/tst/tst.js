case1 = {
  title: "Display All Users",
  description: `"
     1. Show a list of all users including pending
        invites and accepted invites
     2. ui should be mobile responsive
     3. should have a toggle button to
        disable and enable active users (not pending users)
     4. a drop down that contains a list actions
        for each user
        i.e 
        actions =>  
           resend invitation to users with pending invites
           edit active invites
           delete invites
     5. add user button: this button should
        show a modal to send invites to users
  `,
};
case2 = {
  title: "Add User Modal",
  description: `"
       ui should  have
       1. email input field
       2. dropdown for the primary role that
          shows a list all possible role
          i.e 
          roles = [Admin, Approver, Initiator, Viewer, Developer]
       3. If the selected primary role is not 
          admin, a tab to select user access 
          i.e user access should either All or Restricted
       4. Also, If the selected primary role is 
          not admin, a table showing all the accounts and
          the roles for assigned to each accounts
          
          Note*
           ** When the user access is ALL,  
              the default roles
              on all the accounts will be the 
              primary role.
              However, user should also be able
               to change the roles
           ** When the user access is RESTRICTED, 
              the default roles
              on all the accounts will be the 
              Not Assigned
              However, user should also be able
               to change the roles

       
    `,
};

case3 = {
    title: "Edit User Page",
    description: `"
         ui should have
         1. ** a card that displays the user information
            ** the admin primary should be editable with the 
            following roles
            i.e 
             [Admin, Approver, Initiator, Viewer, Developer]
            ** a toggle button to enable and disable user
         2. a tab to display the user access and it should be
            editable
            i.e user access can be changed to either All or 
            Restricted
         3. Also, All the accounts should be displayed along side 
            the user permissions on each account
            Note*
             ** roles should also be editable 
            
         
      `,
  };
