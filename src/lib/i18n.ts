export type Lang = 'en' | 'pt'

export const translations = {
  en: {
    // topbar
    inbox: 'Inbox',
    logout: 'Log out',
    closeSidebar: 'Close sidebar',
    openSidebar: 'Open sidebar',
    allProjects: 'All projects',
    // view tabs
    list: 'List',
    board: 'Board',
    agenda: 'Agenda',
    // add task bar
    addTaskPlaceholder: 'Add a new task…',
    add: 'Add',
    dueDate: 'Due date',
    // priority
    urgent: 'Urgent',
    high: 'High',
    normal: 'Normal',
    low: 'Low',
    // category
    work: 'Work',
    personal: 'Personal',
    health: 'Health',
    study: 'Study',
    other: 'Other',
    // status
    todo: 'To Do',
    inprogress: 'In Progress',
    done: 'Done',
    // sidebar
    projects: 'Projects',
    newProject: 'New project',
    projectName: 'Project name',
    descriptionOptional: 'Description (optional)',
    create: 'Create',
    creating: 'Creating…',
    cancel: 'Cancel',
    // kanban
    empty: 'Empty',
    nothingDoneYet: 'Nothing done yet',
    moveToNextStage: 'Move to next stage',
    // agenda groups
    overdue: 'Overdue',
    today: 'Today',
    tomorrow: 'Tomorrow',
    noDate: 'No date',
    taskSingular: 'task',
    taskPlural: 'tasks',
    allDone: 'All done!',
    noDatesSet: 'No dates set',
    addDueDateHint: 'Add a due date to tasks to see them here.',
    nothingScheduled: 'Nothing scheduled. Enjoy the day.',
    // confirm dialog
    deleteTaskTitle: 'Delete task?',
    deleteProjectTitle: 'Delete project?',
    permanentlyRemoved: 'will be permanently removed.',
    projectDeletedTasksInbox: 'will be deleted. Its tasks will move to Inbox.',
    delete: 'Delete',
    deleting: 'Deleting…',
    // date picker
    clear: 'Clear',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekDays: ['Su','Mo','Tu','We','Th','Fr','Sa'],
    // login
    loginTitle: 'Welcome to MyAgenda',
    loginSubtitle: 'Enter your email to receive a magic link — no password needed.',
    emailPlaceholder: 'your@email.com',
    sendMagicLink: 'Send magic link',
    sending: 'Sending…',
    checkEmail: 'Check your email',
    magicLinkSentTo: "We've sent a login link to",
    clickLinkToSignIn: 'Click the link in the email to sign in.',
    // delete project dialog description suffix
    deleteProjectSuffix: 'will be deleted. Its tasks will move to Inbox.',
  },
  pt: {
    // topbar
    inbox: 'Caixa de entrada',
    logout: 'Sair',
    closeSidebar: 'Fechar barra lateral',
    openSidebar: 'Abrir barra lateral',
    allProjects: 'Todos os projetos',
    // view tabs
    list: 'Lista',
    board: 'Quadro',
    agenda: 'Agenda',
    // add task bar
    addTaskPlaceholder: 'Adicionar uma tarefa…',
    add: 'Adicionar',
    dueDate: 'Prazo',
    // priority
    urgent: 'Urgente',
    high: 'Alta',
    normal: 'Normal',
    low: 'Baixa',
    // category
    work: 'Trabalho',
    personal: 'Pessoal',
    health: 'Saúde',
    study: 'Estudo',
    other: 'Outro',
    // status
    todo: 'A fazer',
    inprogress: 'Em andamento',
    done: 'Concluído',
    // sidebar
    projects: 'Projetos',
    newProject: 'Novo projeto',
    projectName: 'Nome do projeto',
    descriptionOptional: 'Descrição (opcional)',
    create: 'Criar',
    creating: 'Criando…',
    cancel: 'Cancelar',
    // kanban
    empty: 'Vazio',
    nothingDoneYet: 'Nada concluído ainda',
    moveToNextStage: 'Próxima etapa',
    // agenda groups
    overdue: 'Atrasado',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    noDate: 'Sem data',
    taskSingular: 'tarefa',
    taskPlural: 'tarefas',
    allDone: 'Tudo feito!',
    noDatesSet: 'Sem datas definidas',
    addDueDateHint: 'Adicione um prazo às tarefas para vê-las aqui.',
    nothingScheduled: 'Nada agendado. Aproveite o dia.',
    // confirm dialog
    deleteTaskTitle: 'Excluir tarefa?',
    deleteProjectTitle: 'Excluir projeto?',
    permanentlyRemoved: 'será removida permanentemente.',
    projectDeletedTasksInbox: 'será excluído. As tarefas irão para a Caixa de entrada.',
    delete: 'Excluir',
    deleting: 'Excluindo…',
    // date picker
    clear: 'Limpar',
    months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    weekDays: ['Do','Se','Te','Qu','Qu','Se','Sá'],
    // login
    loginTitle: 'Bem-vindo ao MyAgenda',
    loginSubtitle: 'Digite seu e-mail para receber um link mágico — sem senha.',
    emailPlaceholder: 'seu@email.com',
    sendMagicLink: 'Enviar link mágico',
    sending: 'Enviando…',
    checkEmail: 'Verifique seu e-mail',
    magicLinkSentTo: 'Enviamos um link de acesso para',
    clickLinkToSignIn: 'Clique no link do e-mail para entrar.',
    // delete project dialog description suffix
    deleteProjectSuffix: 'será excluído. As tarefas irão para a Caixa de entrada.',
  },
} as const

export type TranslationKey = keyof typeof translations.en
