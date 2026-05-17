'use client'

import { Link, usePage } from '@inertiajs/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/ui/components/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-react'

export function NavMain({
  items,
  title = 'Main Menu',
}: {
  title?: string
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { url } = usePage()
  const pathname = url.split('?')[0]

  const isMatch = (target: string) =>
    target !== '#' && (pathname === target || pathname.startsWith(`${target}/`))

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-[0.12em] text-slate-500/90 uppercase">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length)
          const activeSubItemUrl =
            item.items
              ?.filter((subItem) => isMatch(subItem.url))
              .sort((a, b) => b.url.length - a.url.length)[0]?.url ?? null
          const subActive = Boolean(activeSubItemUrl)
          const itemActive = subActive || isMatch(item.url)

          return (
            <Collapsible key={item.title} asChild defaultOpen={itemActive || item.isActive}>
              <SidebarMenuItem>
                <div className="relative">
                  {hasChildren ? (
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        data-active={itemActive}
                        className="h-11 rounded-md px-2.5 pr-10 text-slate-700 transition-all hover:bg-primary/[0.08] hover:text-slate-950 data-[active=true]:bg-primary/12 data-[active=true]:text-primary data-[active=true]:ring-1 data-[active=true]:ring-primary/20"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/[0.07] text-primary">
                          <item.icon className="size-3.5" />
                        </span>
                        <span className="truncate text-[13px] font-medium tracking-[0.01em]">
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      data-active={itemActive}
                      className="h-11 rounded-md px-2.5 pr-10 text-slate-700 transition-all hover:bg-primary/[0.08] hover:text-slate-950 data-[active=true]:bg-primary/12 data-[active=true]:text-primary data-[active=true]:ring-1 data-[active=true]:ring-primary/20"
                    >
                      <Link href={item.url}>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/[0.07] text-primary">
                          <item.icon className="size-3.5" />
                        </span>
                        <span className="truncate text-[13px] font-medium tracking-[0.01em]">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {hasChildren ? (
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="absolute top-1/2 right-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-all hover:bg-primary/10 hover:text-primary data-[state=open]:rotate-90"
                      >
                        <ChevronRight className="size-4" />
                        <span className="sr-only">Toggle</span>
                      </button>
                    </CollapsibleTrigger>
                  ) : null}
                </div>
                {hasChildren ? (
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-primary/20">
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            data-active={activeSubItemUrl === subItem.url}
                            className="rounded-md text-slate-600 hover:bg-primary/[0.08] hover:text-slate-900 data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
