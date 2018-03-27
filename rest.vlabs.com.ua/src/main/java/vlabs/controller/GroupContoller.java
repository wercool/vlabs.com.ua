package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Group;
import vlabs.model.User;
import vlabs.service.GroupService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class GroupContoller
{
    @Autowired
    private GroupService groupService;

    @RequestMapping(method = RequestMethod.GET, value = "/group/{groupId}")
    public Group loadById(@PathVariable Long groupId) {
        return groupService.findById(groupId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/group/add")
    public Group addNewGroup(@RequestBody Group group) {
        return groupService.addNew(group);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/group/all")
    public List<Group> getAllGroups() {
        return groupService.findAll();
    }

    @RequestMapping(method = RequestMethod.POST, value= "/group/update")
    public Group updateGroup(@RequestBody Group group) {
        return groupService.updateGroup(group);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/group/{groupId}/members")
    public List<User> groupMembersByGroupId(@PathVariable Long groupId) {
        return groupService.getGroupMembersByGroupId(groupId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/group/{groupId}/non-members")
    public List<User> nonGroupMembersByGroupId(@PathVariable Long groupId) {
        return groupService.nonGroupMembersByGroupId(groupId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/group/{groupId}/addmembers")
    public Group addGroupMembers(@PathVariable Long groupId, @RequestBody List<User> newGroupMembers) {
        return groupService.updateGroupMembers(groupId, newGroupMembers, "add");
    }

    @RequestMapping(method = RequestMethod.POST, value= "/group/{groupId}/removemembers")
    public Group removeGroupMembers(@PathVariable Long groupId, @RequestBody List<User> removeGroupMembers) {
        return groupService.updateGroupMembers(groupId, removeGroupMembers, "remove");
    }
}
