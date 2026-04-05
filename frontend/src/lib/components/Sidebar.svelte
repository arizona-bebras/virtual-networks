<script lang="ts">
 import * as Sidebar from "$lib/components/ui/sidebar/index.js";
 
 // Menu items.
 const items = [
  {
   title: "Сеть",
   url: "network",
  },
  {
   title: "Пользователи",
   url: "users",
  },
  {
   title: "Панель управления",
   url: "control-panel",
  },
//   {
//    title: "Search",
//    url: "#",
//   },
//   {
//    title: "Settings",
//    url: "#",
//   },
 ];
</script>
 
<Sidebar.Root>
 <Sidebar.Content>
  <Sidebar.Group>
   <!-- <Sidebar.GroupLabel>Application</Sidebar.GroupLabel> -->
   <Sidebar.GroupContent>
    <Sidebar.Menu>
     {#each items as item (item.title)}
      <Sidebar.MenuItem>
       <Sidebar.MenuButton>
        {#snippet child({ props })}
         <a href={`/dashboard/${item.url}`} {...props}>
          <span>{item.title}</span>
         </a>
        {/snippet}
       </Sidebar.MenuButton>
      </Sidebar.MenuItem>
     {/each}
    </Sidebar.Menu>
   </Sidebar.GroupContent>
  </Sidebar.Group>
 </Sidebar.Content>
</Sidebar.Root>