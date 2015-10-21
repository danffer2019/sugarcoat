/*
 * This is the configuration file that is needed to create the real 
 * documentation such as the pattern library. 
 *
 * When a new project is created this file will need to be updated with the
 * correct paths from your project.
 *
 */
var patterns = {
    //The pattern library will be created and include documentation for colors,
    //typography, UI elements and more complex components.
    settings: {
        dest: 'demo/documentation/pattern-library',
        //include path to where the templates will live for the pattern library
        template: 'demo/documentation/templates/main.hbs'
    },
    sections: [
        {
            title: 'Colors',
            files: 'demo/library/styles/global/colors.scss',
            type: 'variables',
            template: 'color'
        },
        {
            title: 'Components',
            files: 'demo/components/*.html'
        },
        // what about 'not' typography?
        {
            title: 'UI Kit',
            files: {
                src: [ 
                    'demo/library/styles/base/feedback.scss',
                    'demo/library/styles/global/*.scss',
                    'demo/library/styles/global/*',
                    '!demo/library/styles/global/typography.scss',
                    '!demo/library/styles/global/colors.scss'
                ],
                options: {}
            }
        },
        {
            title: 'UI Kit2',
            files: [
                'demo/library/styles/base/feedback.scss',
                'demo/library/styles/global/*',
                '!demo/library/styles/global/typography.scss',
                '!demo/library/styles/global/colors.scss'
            ]
        },
        {
            title: 'Typography',
            files: 'demo/library/styles/global/typography.scss',
            type: 'variables',
            template: 'typography'
        }
    ]
};

module.exports = patterns;