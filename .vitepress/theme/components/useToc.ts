import { onContentUpdated, DefaultTheme } from "vitepress";
import { onMounted, ref, computed } from "vue";

interface TocItem {
  text: string;
  id: string;
  level: number;
}

export default function () {
  const headers = ref<DefaultTheme.OutlineItem[]>([]);
  const hasToc = computed(() => headers.value.length > 0);
  const resolvedHeaders = [];

  const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;

  onContentUpdated(() => {
    headers.value = getHeaders(true);
  });

  const getHeaders = (range) => {
    const headers = [
      ...document.querySelectorAll(".up-doc :where(h1,h2,h3,h4,h5,h6)"),
    ]
      .filter((el) => el.id && el.hasChildNodes())
      .map((el) => {
        const level = Number(el.tagName[1]);
        return {
          element: el,
          title: serializeHeader(el),
          link: "#" + el.id,
          level,
        };
      });
    return buildTree(headers, 2, 6);
  };

  function serializeHeader(h) {
    let ret = "";
    for (const node of h.childNodes) {
      if (node.nodeType === 1) {
        if (ignoreRE.test(node.className)) continue;
        ret += node.textContent;
      } else if (node.nodeType === 3) {
        ret += node.textContent;
      }
    }
    return ret.trim();
  }

  const buildTree = (data, min, max) => {
    resolvedHeaders.length = 0;
    const result = [];
    const stack = [];
    data.forEach((item) => {
      const node = { ...item, children: [] };
      let parent = stack[stack.length - 1];
      while (parent && parent.level >= node.level) {
        stack.pop();
        parent = stack[stack.length - 1];
      }
      if (
        node.element.classList.contains("ignore-header") ||
        (parent && "shouldIgnore" in parent)
      ) {
        stack.push({ level: node.level, shouldIgnore: true });
        return;
      }
      if (node.level > max || node.level < min) return;
      resolvedHeaders.push({ element: node.element, link: node.link });
      if (parent) parent.children.push(node);
      else result.push(node);
      stack.push(node);
    });
    return result;
  };

  return {
    headers,
    hasToc,
  };
}
