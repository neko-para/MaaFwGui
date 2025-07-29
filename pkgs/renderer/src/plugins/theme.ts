import { type GlobalThemeOverrides, lightTheme } from 'naive-ui'
import { computed } from 'vue'

export const theme = computed(() => {
    return lightTheme
})

export const themeOverride = computed<GlobalThemeOverrides>(() => {
    return {
        common: {
            // fontFamily: getVar('--vscode-font-family'),
            // fontFamilyMono: getVar('--vscode-editor-font-family'),
            // borderColor: getVar('--vscode-editorWidget-border'),
            // borderRadius: '0',
            cardColor: 'transparent',
            inputColor: 'transparent',
            inputColorDisabled: 'transparent',
            popoverColor: '#F0F0F0',
            hoverColor: '#F7F7F7'
        },
        Card: {
            // borderColor: getVar('--vscode-editorWidget-border')
        },
        Select: {
            // peers: {
            //   InternalSelection: {
            //     border: `${getVar('--vscode-editorWidget-border')} solid 1px`,
            //     borderRadius: '0'
            //   }
            // }
        }
    }
})
