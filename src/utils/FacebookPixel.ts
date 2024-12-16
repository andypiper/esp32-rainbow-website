import ReactPixel from 'react-facebook-pixel';

const options = {
    autoConfig: true,
    debug: false,
};

export const initFacebookPixel = () => {
    ReactPixel.init('8462774477184442', undefined, options);
    ReactPixel.pageView();
    return ReactPixel;
}; 