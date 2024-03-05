function adaComplianceFixer() {
    // Telerik Control
    var t_i_arrow_down = $('.t-i-arrow-down');
    if (t_i_arrow_down.attr('title') === undefined || t_i_arrow_down.attr('title') === null || t_i_arrow_down.attr('title').length === 0) {
        t_i_arrow_down.attr('title', 'ADAComplianceForDropdown');
    }   
    var _radPreventDecorate = $('.radPreventDecorate');
    if (_radPreventDecorate.attr('title') === undefined || _radPreventDecorate.attr('title') === null || _radPreventDecorate.attr('title').length === 0) {
        _radPreventDecorate.attr('title', 'ADAComplianceForDropdown');
    }   
     $('.rdpPageNext').attr('title', 'ADAComplianceForPagingNextButton');

    $('.rdpPagePrev').attr('title', 'ADAComplianceForPagingPrevButton');
    // pnl custon footer images
    $('#pnlCustomFooterContent img').attr('alt', 'ADAComplianceForImage');

    $('#pnlPoweredBy img').attr('alt', 'ADAComplianceForImage');

}
