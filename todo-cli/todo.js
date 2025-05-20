const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };
  const todays = new Date();

  const overdue = () => {
    return all.filter((item) => {
      return item.dueDate < formattedDate(todays);
    });
  };

  const dueToday = () => {
    return all.filter((item) => {
      return item.dueDate == formattedDate(todays);
    });
  };

  const dueLater = () => {
    return all.filter((item) => {
      return item.dueDate > formattedDate(todays);
    });
  };

  const toDisplayableList = (list) => {
    // Format the To-Do list here, and return the output string
    // as per the format given above.
    s = "";
    list.forEach((item) => {
      s += "[";
      s += item.completed ? "x" : " ";
      s += "] ";
      s += item.title;
      s += " ";
      s += item.dueDate == formattedDate(todays) ? "" : item.dueDate;
      s += "\n";
    });
    return s.trim();
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

module.exports = todoList;
