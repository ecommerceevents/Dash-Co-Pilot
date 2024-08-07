import { OnboardingStepBlockDto } from "../OnboardingBlockUtils";

export const saasrockOnboardingStepBlocks: OnboardingStepBlockDto[] = [
  {
    id: "1",
    title: "Welcome!",
    description:
      "This onboarding's purpose is to showcase the Onboarding feature in SaasRock Enterprise 🚀.\n\n- **Filters**: Automatically _(or manually)_ create sessions\n- **Steps**: Each step can have _Links_, _Gallery_ or _Input_\n- **Links**: Use links with variables like _$tenant_ or _$user_\n- **Activity**: Sessions are tracked for statistics _(e.g. link-click)_\n- **Markdown**: HTML and Markdown syntax support\n\nOnce you've set your onboarding flow, you can Activate it and it will appear as a modal for your end-users, which can _(or cannot)_ be dismissed.",
    links: [],
    gallery: [],
    input: [],
    icon: '<svg className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 32 32">       <path d="M 19 6 L 19 7.4375 L 19.09375 7.625 L 20.125 10 L 11.4375 10 L 11.125 10.4375 L 8.40625 14.28125 C 7.800781 14.09375 7.164063 14 6.5 14 C 2.917969 14 0 16.914063 0 20.5 C 0 24.085938 2.914063 27 6.5 27 C 9.914063 27 12.707031 24.347656 12.96875 21 L 16.40625 21 L 16.71875 20.5625 L 21.59375 13.375 L 22.25 14.875 C 20.308594 16.003906 19 18.109375 19 20.5 C 19 24.070313 21.929688 27 25.5 27 C 29.070313 27 32 24.070313 32 20.5 C 32 16.929688 29.070313 14 25.5 14 C 25.019531 14 24.546875 14.054688 24.09375 14.15625 L 21.40625 8 L 24.5 8 C 24.785156 8 25 8.214844 25 8.5 C 25 8.785156 24.785156 9 24.5 9 L 24.5 11 C 25.867188 11 27 9.867188 27 8.5 C 27 7.132813 25.867188 6 24.5 6 Z M 8 7 L 8 9 L 14 9 L 13 7 Z M 13.46875 12 L 20.125 12 L 16.09375 17.9375 Z M 11.71875 13 L 14.34375 19 L 6 19 L 6 21 L 10.9375 21 C 10.683594 23.242188 8.808594 25 6.5 25 C 4.019531 25 2 22.980469 2 20.5 C 2 18.019531 4.019531 16 6.5 16 C 8.058594 16 9.441406 16.796875 10.25 18 L 12.5 18 C 12.019531 16.847656 11.230469 15.859375 10.21875 15.15625 Z M 25.5 16 C 27.980469 16 30 18.019531 30 20.5 C 30 22.980469 27.980469 25 25.5 25 C 23.019531 25 21 22.980469 21 20.5 C 21 18.925781 21.832031 17.554688 23.0625 16.75 L 25.09375 21.40625 L 26.90625 20.59375 L 24.9375 16.0625 C 25.125 16.039063 25.308594 16 25.5 16 Z"></path>     </svg>',
  },
  {
    id: "2",
    title: "Filters",
    description:
      "You can add multiple filters to create user sessions in real time:\n\n  - **admin.portal**: _Triggers for /admin users_\n  - **user.is**: _Specific user id_\n  - **user.language**: _User selected locale_\n  - **user.firstName.notSet**: _User has no first name_\n  - **user.lastName.notSet**: _User has no last name_\n  - **user.avatar.notSet**: _User has no avatar_\n  - **user.roles.contains**: _User has a specific role_\n  - **user.roles.notContains**: _User does not have a specific role_\n  - **tenant.portal**: _Triggers for /app users_\n  - **tenant.is**: _Specific tenant id_\n  - **tenant.members.hasOne**: _Has only 1 user_\n  - **tenant.members.hasMany**: _Has more than 1 user_\n  - **tenant.subscription.products.has**: _Has a specific plan_\n  - **tenant.subscription.active**: _Has an active subscription_\n  - **tenant.subscription.inactive**: _Has an inactive subscription_\n  - **tenant.api.used**: _Has used the API_\n  - **tenant.api.notUsed**: _Has not used the API_\n  - **tenant.user.entity.hasCreated**: _Has created an entity_\n  - **tenant.user.entity.hasNotCreated**: _Has not created an entity_",
    links: [],
    gallery: [],
    input: [],
    icon: '<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>       <path         strokeLinecap="round"         strokeLinejoin="round"         d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"       />     </svg>',
  },
  {
    id: "3",
    title: "Steps",
    description: "Onboarding steps can have 1 or more:\n- **Links**\n- **Image or Video**\n- **Input field** _(text/select, required/not-required)_",
    links: [],
    gallery: [],
    input: [],
    icon: '<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>       <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />     </svg>',
  },
  {
    id: "4",
    title: "Links",
    description:
      "You can add multiple links to a step, which will be tracked. You can also use the variables **$tenant** or **$user** in the link _href_. There's a third variable called **$appOrAdmin** which will be replaced based on the current session _(e.g. **/app/$tenant** or **/admin**)_.",
    links: [
      {
        text: "View my profile",
        href: "$appOrAdmin/settings/profile",
        isPrimary: true,
      },
      {
        text: "New tab link",
        href: "https://saasrock.com",
        isPrimary: false,
        target: "_blank",
      },
    ],
    gallery: [],
    input: [],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" className={className} fill="currentColor"> {" "} <path d="M 37 4 C 34.596 4 32.336719 4.9367188 30.636719 6.6367188 L 25.636719 11.636719 C 24.191719 13.081719 23.2985 14.930688 23.0625 16.929688 C 23.0215 17.281688 23 17.64 23 18 C 23 19.368 23.313672 20.686766 23.888672 21.884766 L 25.414062 20.357422 C 25.147062 19.609422 25 18.817 25 18 C 25 16.13 25.728781 14.373781 27.050781 13.050781 L 32.050781 8.0507812 C 33.373781 6.7287812 35.13 6 37 6 C 38.87 6 40.626219 6.7287812 41.949219 8.0507812 C 43.272219 9.3727813 44 11.13 44 13 C 44 14.87 43.271219 16.626219 41.949219 17.949219 L 36.949219 22.949219 C 35.626219 24.271219 33.87 25 32 25 C 31.183 25 30.390578 24.852938 29.642578 24.585938 L 28.115234 26.111328 C 29.313234 26.686328 30.632 27 32 27 C 34.404 27 36.663281 26.063281 38.363281 24.363281 L 43.363281 19.363281 C 45.063281 17.663281 46 15.404 46 13 C 46 10.596 45.063281 8.3367187 43.363281 6.6367188 C 41.663281 4.9367187 39.404 4 37 4 z M 30.980469 17.990234 A 1.0001 1.0001 0 0 0 30.292969 18.292969 L 18.292969 30.292969 A 1.0001 1.0001 0 1 0 19.707031 31.707031 L 31.707031 19.707031 A 1.0001 1.0001 0 0 0 30.980469 17.990234 z M 18 23 C 15.596 23 13.336719 23.936719 11.636719 25.636719 L 6.6367188 30.636719 C 5.0727187 32.199719 4.1545781 34.236828 4.0175781 36.423828 C 4.0055781 36.614828 4 36.807 4 37 C 4 39.404 4.9367188 41.663281 6.6367188 43.363281 C 8.3367187 45.063281 10.596 46 13 46 C 15.404 46 17.663281 45.063281 19.363281 43.363281 L 24.363281 38.363281 C 26.063281 36.663281 27 34.404 27 32 C 27 30.632 26.686328 29.313234 26.111328 28.115234 L 24.585938 29.642578 C 24.852938 30.390578 25 31.183 25 32 C 25 33.87 24.271219 35.626219 22.949219 36.949219 L 17.949219 41.949219 C 16.626219 43.271219 14.87 44 13 44 C 11.13 44 9.3737813 43.271219 8.0507812 41.949219 C 6.7277812 40.627219 6 38.87 6 37 C 6 35.13 6.7287812 33.373781 8.0507812 32.050781 L 13.050781 27.050781 C 14.373781 25.728781 16.13 25 18 25 C 18.817 25 19.609422 25.147062 20.357422 25.414062 L 21.884766 23.888672 C 20.686766 23.313672 19.368 23 18 23 z"></path> </svg>',
  },
  {
    id: "5",
    title: "Images & Videos",
    description: "You can add 1 or more images and videos, for example:",
    links: [],
    gallery: [
      {
        id: "1",
        type: "video",
        title: "v0.8 - Page Block Builder",
        src: "https://www.loom.com/embed/eccf927d35cd4ad3b4a1d512257cea53",
      },
      {
        id: "2",
        type: "image",
        title: "Admin Portal",
        src: "https://yahooder.sirv.com/saasrock/seo/admin-portal.png",
      },
    ],
    input: [],
    icon: '<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /> </svg>',
  },
  {
    id: "6",
    title: "Inputs",
    description: "You can ask your users to fill 1 or more fields. First name is required.",
    links: [],
    gallery: [],
    input: [
      { id: "1", type: "text", name: "firstName", title: "First name", isRequired: true, options: [] },
      { id: "2", type: "text", name: "lastName", title: "Last name", isRequired: false, options: [] },
      {
        id: "3",
        type: "select",
        name: "whereDidYouHearAboutUs",
        title: "Where did you hear about us?",
        isRequired: false,
        options: [
          { value: "google", name: "Google" },
          { value: "youtube", name: "YouTube" },
          { value: "twitter", name: "Twitter" },
          { value: "other", name: "Other" },
        ],
      },
    ],
    icon: '<svg className={clsx(className, "h-5 w-5 flex-shrink-0")} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 172 172" fill="currentColor" > <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" > <path d="M0,172v-172h172v172z" fill="none"></path> <g fill="currentColor"> <path d="M146.59473,57.24935c-5.28183,0 -9.90758,1.23715 -13.89941,3.69531c-3.98467,2.451 -7.04629,5.9742 -9.19629,10.56803c-2.14283,4.59384 -3.2194,9.90187 -3.2194,15.92904v3.83528c0,9.44567 2.33353,16.88702 6.9847,22.29785c4.65117,5.41083 11.04261,8.11849 19.16244,8.11849c7.42467,0 13.40816,-1.93175 17.94466,-5.80892c4.5365,-3.87717 7.05009,-9.19203 7.54459,-15.94304v-0.014h-13.03157c-0.29383,3.81983 -1.4442,6.6341 -3.42936,8.45443c-1.98517,1.8275 -4.99348,2.74349 -9.02832,2.74349c-4.46483,0 -7.74101,-1.5573 -9.81218,-4.68913c-2.07117,-3.12467 -3.10742,-8.08556 -3.10742,-14.86523v-4.73112c0.05733,-6.48583 1.16705,-11.2725 3.33138,-14.36133c2.16433,-3.08883 5.40602,-4.63314 9.75618,-4.63314c4.00617,0 6.98784,0.92316 8.94434,2.74349c1.96367,1.82033 3.10686,4.7552 3.42936,8.80436h13.04557c-0.69517,-7.009 -3.27573,-12.4438 -7.74056,-16.32096c-4.46483,-3.87717 -10.36871,-5.82292 -17.67871,-5.82292zM23.58561,58.11719l-23.58561,62.70833h13.88542l4.35319,-12.91959h22.87174l4.40918,12.91959h13.87142l-23.71159,-62.70833zM65.31185,58.11719v62.70833h24.63542c7.19533,-0.05733 12.73058,-1.64195 16.61491,-4.74511c3.8915,-3.10317 5.83691,-7.66229 5.83691,-13.68946c0,-3.53317 -0.94298,-6.52167 -2.81348,-8.95833c-1.8705,-2.43667 -4.43807,-4.06842 -7.68457,-4.87109c2.84517,-1.08933 5.06459,-2.79355 6.66276,-5.13705c1.59816,-2.3435 2.39355,-5.04399 2.39355,-8.11849c0,-5.62583 -1.98539,-9.90478 -5.96289,-12.82161c-3.9775,-2.91683 -9.80692,-4.36719 -17.49675,-4.36719zM78.35742,68.58724h9.1403c3.59767,0 6.2247,0.61465 7.89453,1.86165c1.66983,1.247 2.50553,3.29969 2.50553,6.14486c0,5.08117 -3.29599,7.68189 -9.88216,7.79655h-9.6582zM29.63249,73.96224l7.96452,23.47364h-15.84505zM78.35742,93.5306h11.96777c6.00567,0.086 9.00032,2.99387 9.00032,8.73438c0,2.55133 -0.86235,4.55722 -2.58952,6.00489c-1.72717,1.44767 -4.12016,2.16959 -7.19466,2.16959h-11.18392z"></path> </g> </g> </svg>',
  },
  {
    id: "7",
    title: "Activity",
    description:
      "Every onboarding session will track:\n\n  - **completedAt**: User reached the final step\n\n  - **dismissedAt**: User closed the onboarding session\n\n  - **step.seenAt**: A specific step was seen\n\n  - **link.click**: User clicked on a link\n\n  - **input.value**: User filled an input field\n\n",
    links: [],
    gallery: [],
    input: [],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-6 h-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> </svg>',
  },
  {
    id: "8",
    title: "The end",
    description: "",
    links: [],
    gallery: [{ id: "1", type: "image", title: "", src: "https://www.gifcen.com/wp-content/uploads/2021/05/the-end-gif-13.gif" }],
    input: [],
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /> </svg>',
  },
];
